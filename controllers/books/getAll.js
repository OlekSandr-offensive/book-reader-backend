const {Book} = require("../../models/book");

const getAll = async(req, res) => {
    const {_id: owner} = req.user;
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
    const result = await Book.find({owner}, "-createdAt -updatedAt", {skip, limit: Number(limit)})
                            .populate("owner", "email",);
    res.json(result);
}

module.exports = getAll;