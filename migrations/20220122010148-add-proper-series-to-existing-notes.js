const mongoose = require("mongoose");

module.exports = {
    async up(db, client) {
        // Because I set the `series` null in the last migration smh
        // Also I want to change the series field to seriesId
        await db.collection("notes").updateMany(
            {},
            {
                $set: { seriesId: mongoose.Types.ObjectId("61eb282fe68fd8f02125d6b2") }, // id of news series
                $unset: { series: "" },
            }
        );
    },
};
