import got from "got";
import { DateTime } from "luxon";
import SteamApi from "../api/steam.js";

const delayBetweenSteamApiCalls = 1000;

let removedGames = [];
let purchasesToProcess = [];
const steamId = process.env.STEAM_ID;
let date = null;

const getNewGamesForUser = () => {
  let gamesList = {};

  removedGames = [];
  purchasesToProcess = [];
  date = DateTime.now().setZone("America/New_York").toISO();

  if (!steamId) {
    console.warn("SteamID is required.");
    return;
  }

  console.log(
    `Getting currently tracked purchases for steam id ${steamId} (${new Date(Date.now())})`,
  );
  // Get current list of games owned from mongo
  got(`http://${process.env.API_URL}/api/purchases/${steamId}`)
    .then((res) => {
      var results = JSON.parse(res.body);
      console.log(`Found ${results.length} existing purchases.`);
      gamesList.current = results;
      console.log(`Pulling games list from the steam api for user ${steamId}`);
      // Get a new list of games owned from the steam api
      return SteamApi.getOwnedGames(process.env.STEAM_API_KEY, steamId);
    })
    .then((res) => {
      var apiResults = JSON.parse(res.body);
      if (!apiResults.response || !apiResults.response.game_count) {
        const message = `Received invalid api response for user ${steamId}.  Is the users profile private?`;
        return Promise.reject(message);
      }
      console.log(
        `Steam returned ${apiResults.response.game_count} owned games.`,
      );
      gamesList.new = apiResults.response.games;
      // Compare with existing list to get the new purchases.
      return Promise.resolve(getNewPurchases(gamesList.new, gamesList.current));
    })
    .then((newGames) => {
      console.log(`Found ${newGames.length} new purchases since the last run.`);
      purchasesToProcess = newGames;
      console.log("Processing purchases.");
      // Process each record.
      setTimeout(processPurchase, delayBetweenSteamApiCalls);
    })
    .catch((err) => {
      console.error(err);
    });
};

const getNewPurchases = (newList, current) => {
  const existing = current.reduce((acc, cur) => {
    acc[cur.appId] = cur;
    return acc;
  }, {});

  const onlyNew = [];

  for (let i = 0; i < newList.length; i++) {
    if (!existing[newList[i].appid]) {
      onlyNew.push(newList[i]);
    }
  }
  return onlyNew;
};

const processPurchase = () => {
  if (purchasesToProcess.length == 0) {
    console.log("No purchases to process.");
    return;
  }

  const nextItem = purchasesToProcess.pop();
  console.debug(`Processing ${nextItem.appid}`);
  SteamApi.getAppDetails(nextItem.appid)
    .then((res) => {
      var steamResult = JSON.parse(res.body)[nextItem.appid];
      if (!steamResult.success || !steamResult.data) {
        console.warn(
          `Received an invalid steam api response for ${nextItem.appid}`,
        );

        removedGames.push(nextItem.appid);

        doNext();
        return;
      }
      const purchase = {
        steamId,
        appId: nextItem.appid,
        name: steamResult.data.name,
        type: steamResult.data.type,
        headerImage: steamResult.data.header_image,
        developers: steamResult.data.developers,
        price: steamResult.data.price_overview
          ? steamResult.data.price_overview.final
          : 0,
        priceFormatted: steamResult.data.price_overview
          ? steamResult.data.price_overview.final_formatted
          : "$0.00",
        datePurchased: date,
      };

      console.debug(
        `Adding ${purchase.name} (appid: ${purchase.appId}) with price ${purchase.priceFormatted}`,
      );
      if (process.env.DRY_RUN === "true") {
        doNext();
        return;
      }
      got
        .post(`http://${process.env.API_URL}/api/purchases`, {
          json: { purchases: purchase },
        })
        .then((r) => {
          doNext();
        })
        .catch((err) => {
          console.error(`Error while adding ${purchase.appId} to mongo.`);
          if (err.response.body) {
            const errorBody = JSON.parse(err.response.body);
            if (errorBody.error && errorBody.error.code === "11000") {
              console.warn(
                "Attempted to add duplicate entry into mongo.  Skipping.",
              );
              doNext();
            }
          }
          console.error(err);
        });
    })
    .catch((error) => {
      console.error(`Error while getting app details for ${nextItem.appid}`);
      console.error(error);
    });
};

// Process games that were removed from the steam store.
const processRemoved = () => {
  if (removedGames.length > 0) {
    console.log(
      `Found ${removedGames.length} games that have been removed from the steam store.`,
    );
    SteamApi.getAppList()
      .then((apps) => {
        const removed = [];
        for (var i = 0; i < removedGames.length; i++) {
          const purchase = {
            steamId,
            appId: removedGames[i],
            price: 0,
            priceFormatted: "$0.00",
            datePurchased: date,
          };
          if (apps[removedGames[i]]) {
            purchase.name = apps[removedGames[i]];
          }
          removed.push(purchase);
        }

        if (removed.length === 0 || process.env.DRY_RUN === "true") {
          return Promise.resolve();
        }

        return got.post(`http://${process.env.API_URL}/api/purchases`, {
          json: { purchases: removed },
        });
      })
      .then(() => {
        removedGames = [];
      })
      .catch((error) => {
        console.error("Error while processing the removed games list.");
        console.error(error);
      });
  }
};

const doNext = () => {
  if (purchasesToProcess.length > 0) {
    setTimeout(processPurchase, delayBetweenSteamApiCalls);
  } else {
    processRemoved();
    console.log("No more purchases to process.");
  }
};

export default getNewGamesForUser;
