const got = require('got');
const path = require('path');
const { DateTime } = require('luxon');
const SteamApi = require('../api/steam');
const Queue = require('./queue');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

class PurchaseProcessor {
    #delayBetweenSteamApiCalls = 1000;
    #longPoll = 60000;
    #getPurchaseInterval = 1000 * 60 * 60;
    #purchaseQueue = null;
    #removedGamesQueue = null;
    #trackedSteamIds = [];
    #getPurchasesInterval = null;
    #processPurchaseTimer = null;

    /**
     * Constructor for the PurchaseProcessor
     * @param {[string]} steamIds List of steam ids to track.
     */
    constructor(steamIds) {
        if (!steamIds || steamIds.length === 0) {
            throw "SteamIds is a required parameter."
        }
        this.#purchaseQueue = new Queue();
        this.#removedGamesQueue = new Queue();
        this.#trackedSteamIds = steamIds;
    }

    /**
     * Starts the purchase processor.
     */
    start = () => {
        console.log("Starting purchase processor.");
        this.#getAllPurchases();
        this.#getPurchasesInterval = setInterval(this.#getAllPurchases, this.#getPurchaseInterval);
        this.#doNext();
    }

    /**
     * Stops the purchase processor.
     */
    stop = () => {
        console.log("Stopping purchase processor");
        clearInterval(this.#getPurchasesInterval);
        clearTimeout(this.#processPurchaseTimer);
    }

    /**
     * Gets a purchases for all tracked users and inserts each to a processing queue.
     */
    #getAllPurchases = async () => {
        for (let i = 0; i < this.#trackedSteamIds.length; i++) {
            const steamId = this.#trackedSteamIds[i]
            const newPurchases = await this.#getNewPurchasesForUser(steamId);
            if (!newPurchases || newPurchases.length === 0) {
                console.log(`Found no new purchases for user ${steamId}`);
                continue;
            }
            this.#addToPurchaseQueue(newPurchases, steamId);
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
            return SteamApi.getOwnedGames(steamId);
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

    /**
     * Adds purchases to the purchase queue.
     * @param {[any]} purchases List of purchases
     * @param {string} steamId The steam id associated with the purchases
     * @returns {undefined}
     */
    #addToPurchaseQueue = (purchases, steamId) => {
        if (!purchases || purchases.length === 0) {
            return;
        }
        console.log(`Adding ${purchases.length} purchases to the process queue.`);
        for (let i = 0; i < purchases.length; i++) {
            purchases[i].steamId = steamId
            this.#purchaseQueue.enqueue(purchases[i])
        }
    }

    /**
     * Processes a purchase, which includes getting app details from the steam
     * api and inserting into mongo.
     * @returns {undefined}
     */
    #processPurchase = () => {
        if (this.#purchaseQueue.isEmpty()) {
            return;
        }

        const nextItem = this.#purchaseQueue.dequeue();
        console.info(`Processing ${nextItem.appid}`);
        SteamApi.getAppDetails(nextItem.appid)
        .then(res => {
            const steamResult = res[nextItem.appid];
            if (!steamResult.success || !steamResult.data) {
                console.warn(`Received and invalid steam api response for ${nextItem.appid}`);

                // Add this to a queue to be processed separately
                this.#removedGamesQueue.enqueue(nextItem.appid);

                return;
            }
            const purchase = {
                steamId: nextItem.steamId,
                appId: nextItem.appid,
                name: steamResult.data.name,
                type: steamResult.data.type,
                headerImage: steamResult.data.header_image,
                developers: steamResult.data.developers,
                price: steamResult.data.price_overview ? steamResult.data.price_overview.final : 0,
                priceFormatted: steamResult.data.price_overview ? steamResult.data.price_overview.final_formatted : "$0.00",
                datePurchased: DateTime.now().setZone('America/New_York').toISO()
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

    /**
     * Processes purchases that were detected, but were removed from steam,
     * meaning there is no app detail for it.
     * @returns {undefined}
     */
    #processRemoved = () => {
        if (this.#removedGamesQueue.isEmpty()) {
            return;
        }

        SteamApi.getAppList()
        .then(apps => {
            const removed = [];
            while (!this.#removedGamesQueue.isEmpty()) {
                const appId = this.#removedGamesQueue.dequeue();
                const purchase = {
                    steamId,
                    appId,
                    price: 0,
                    priceFormatted: "$0.00",
                    datePurchased: DateTime.now().setZone('America/New_York').toISO()
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

    /**
     * Returns a list containing just the new purchases.
     * @param {[any]} newList New list of purchases
     * @param {[any]} current Current list of purchases
     * @returns {[any]} A list of all new purchases
     */
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
    
    /**
     * Process purchases and set up additional timers to handle the remaining queue items.
     */
    #doNext = () => {
        this.#processPurchase();
        if (!this.#purchaseQueue.isEmpty()) {
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
