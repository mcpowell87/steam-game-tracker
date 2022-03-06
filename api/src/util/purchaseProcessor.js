const got = require('got');
const path = require('path');
const SteamApi = require('../api/steam');
const Queue = require('./queue');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

class PurchaseProcessor {
    #delayBetweenSteamApiCalls = 1000;
    #longPoll = 60000;
    #getPurchaseInterval = 1000 * 60 * 60;

    /**
     * Constructor for the PurchaseProcessor
     * @param {[string]} steamIds List of steam ids to track.
     */
    constructor(steamIds) {
        if (!steamIds || steamIds.length === 0) {
            throw "SteamIds is a required parameter."
        }
        this.purchaseQueue = new Queue();
        this.removedGamesQueue = new Queue();
        this.trackedSteamIds = steamIds;
        this.running = false;
        this.getPurchasesInterval = null;
        this.processPurchaseTimer = null;
    }

    start = () => {
        console.log("Starting purchase processor.");
        this.running = true;
        this.#getAllPurchases();
        this.getPurchasesInterval = setInterval(this.#getAllPurchases, this.#getPurchaseInterval);
        this.#doNext();
    }

    stop = () => {
        console.log("Stopping purchase processor");
        this.running = false;
        clearInterval(this.getPurchasesInterval);
        clearTimeout(this.processPurchaseTimer);
    }

    /**
     * Gets a purchases for all tracked users and inserts each to a processing queue.
     */
    #getAllPurchases = async () => {
        for (let i = 0; i < this.trackedSteamIds.length; i++) {
            const newPurchases = await this.#getNewPurchasesForUser(this.trackedSteamIds[i]);
            if (!newPurchases || newPurchases.length === 0) {
                console.log(`Found no new purchases for user ${this.trackedSteamIds[i]}`);
                continue;
            }
            this.#addToPurchaseQueue(newPurchases);
        }
    }

    /**
     * Gets purchases for a specified steam user.
     * @param {string} steamId SteamID to get purchases for
     * @returns 
     */
    #getNewPurchasesForUser = async (steamId) => {
        if (!steamId) {
            console.warn("getPurchasesForUser - SteamID is required.");
            return;
        }
        const gamesList = {};

        console.log(`Getting currently tracked purchases for steam id ${steamId} (${new Date(Date.now())})`);
        return got(`http://${process.env.API_URL}/api/purchases/${steamId}`)
        .then(res => {
            var results = JSON.parse(res.body);
            console.log(`Found ${results.length} existing purchases.`);
            gamesList.current = results;
            console.log(`Pulling games list from the steam api for user ${steamId}`)
            // Get a new list of games owned from the steam api
            return SteamApi.getOwnedGames(process.env.STEAM_API_KEY, steamId);
        }).then(res => {
            var apiResults = JSON.parse(res.body);
            if (!apiResults.response || !apiResults.response.game_count) {
                const message = `Received invalid api response for user ${steamId}.  Is the users profile private?`;
                return Promise.reject(message);
            }
            console.log(`Steam returned ${apiResults.response.game_count} owned games.`);
            gamesList.new = apiResults.response.games;
            // Compare with existing list to get the new purchases.
            return Promise.resolve(this.#filterNewPurchases(gamesList.new, gamesList.current));
        }).catch(err => {
            console.error(err);
        });
    }

    #addToPurchaseQueue = (purchases) => {
        if (!purchases || purchases.length === 0) {
            return;
        }
        console.log(`Adding ${purchases.length} purchases to the process queue.`);
        for (let i = 0; i < purchases.length; i++) {
            this.purchaseQueue.enqueue(purchases[i])
        }
    }

    #processPurchase = () => {
        if (this.purchaseQueue.isEmpty()) {
            return;
        }

        const nextItem = this.purchaseQueue.dequeue();
        console.info(`Processing ${nextItem.appid}`);
        SteamApi.getAppDetails(nextItem.appid)
        .then(res => {
            const steamResult = res[nextItem.appId];
            if (!steamResult.success || !steamResult.data) {
                console.warn(`Received and invalid steam api response for ${nextItem.appid}`);

                // Add this to a queue to be processed separately
                this.removedGamesQueue.enqueue(nextItem.appid);

                return;
            }
            const purchase = {
                steamId,
                appId: nextItem.appid,
                name: steamResult.data.name,
                type: steamResult.data.type,
                headerImage: steamResult.data.header_image,
                developers: steamResult.data.developers,
                price: steamResult.data.price_overview ? steamResult.data.price_overview.final : 0,
                priceFormatted: steamResult.data.price_overview ? steamResult.data.price_overview.final_formatted : "$0.00",
                datePurchased: new Date()
            };

            console.debug(`Adding ${purchase.name} (appid: ${purchase.appId}) with price ${purchase.priceFormatted}`)
            if (process.env.DRY_RUN === "true") {
                return;
            }
            return got.post(`http://${process.env.API_URL}/api/purchases`, { json: { purchases: purchase } })
            .catch(err => {
                console.error(`Error while adding ${purchase.appId} to mongo.`);
                if (err.response.body) {
                    const errorBody = JSON.parse(err.response.body);
                    if (errorBody.error && errorBody.error.code === "11000") {
                        console.warn("Attempted to add duplicate entry into mongo.  Skipping.");
                    }
                }
                console.error(err);
            });
        });
    }

    #processRemoved = () => {
        if (this.removedGamesQueue.isEmpty()) {
            return;
        }

        SteamApi.getAppList()
        .then(apps => {
            const removed = [];
            while (!this.removedGamesQueue.isEmpty()) {
                const appId = this.removedGamesQueue.dequeue();
                const purchase = {
                    steamId,
                    appId,
                    price: 0,
                    priceFormatted: "$0.00",
                    datePurchased: new Date()
                };
                if (apps[appId]) {
                    purchase.name = apps[appId];
                }
                removed.push(purchase);
            }

            if (removed.length === 0 || process.env.DRY_RUN === "true") {
                return Promise.resolve();
            }

            return got.post(`http://${process.env.API_URL}/api/purchases`, { json: { purchases: removed } });
        }).then(() => {
            removedGames = [];
        }).catch(error => {
            console.error("Error while processing the removed games list.");
            console.error(error);
        })  
    }

    #filterNewPurchases = (newList, current) => {
        const existing = current.reduce((acc, cur) => {
            acc[cur.appId] = cur;
            return acc;
        }, {});
    
        const onlyNew = [];
    
        for (let i = 0; i < newList.length; i++) {
            if (!existing[newList[i].appid]) {
                onlyNew.push(newList[i])
            }
        }
        return onlyNew;
    }
    
    #doNext = () => {
        this.#processPurchase();
        if (!this.purchaseQueue.isEmpty()) {
            setTimeout(this.#doNext, this.#delayBetweenSteamApiCalls);
        }
        else {
            this.#processRemoved();
            setTimeout(this.#doNext, this.#longPoll);
            console.log("No purchases in the process queue.  Sleeping.");
        }
    }
}

module.exports = PurchaseProcessor;