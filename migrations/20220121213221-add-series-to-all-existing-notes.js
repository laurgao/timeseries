const mongoose = require("mongoose");

module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});
  
    // 1. remove user from notes
    // 2. create new series with user
    // 3. add series to notes

    const allNotes = await db
      .collection("notes")
      .find()
      .toArray();

    const newSeries = await db.collection("series").insertOne({
      userId: mongoose.Types.ObjectId(allNotes[0].user), // because right now all notes are from the same user
      privacy: "publicVisible",
      title: "News"
    },)

    await db.collection("notes").updateMany({}, {
        $unset: { user: "" },
        $set: { series: mongoose.Types.ObjectId(newSeries._newSeriesid) },
      });
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
