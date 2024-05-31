const { default: mongoose } = require("mongoose");

const appSchema = new mongoose.Schema({
    header: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    },
    footer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    },
    loading: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImgUrl"
    }
},
{
    timestamps: {
        currentTime: () => {
            const ISTOffset = 330; // Offset in minutes for IST
            const now = new Date();
            const ISTTime = new Date(now.getTime() + (ISTOffset * 60000));
            return ISTTime;
        }
    }
});

const App = mongoose.model('App', appSchema);

// Function to ensure default logos are set
async function ensureDefaultLogos(defaultHeaderId, defaultFooterId, defaultLoadingId) {
    const app = await App.findOne(); // Assuming you have only one App document
    if (!app) {
        console.log("App document not found.");
        return;
    }

    let updated = false;

    if (!app.header) {
        app.header = defaultHeaderId;
        updated = true;
    }
    if (!app.footer) {
        app.footer = defaultFooterId;
        updated = true;
    }
    if (!app.loading) {
        app.loading = defaultLoadingId;
        updated = true;
    }

    if (updated) {
        await app.save();
        console.log("App logos updated with default values.");
    } else {
        console.log("App logos are already set.");
    }
}

module.exports = { App, ensureDefaultLogos };
