const mongoose = require("mongoose");

const enumSchema = new mongoose.Schema(
  {
    type: { type: Number, default: 1 },
    name: String,
    status: { type: Number, default: 1 },
  },
  { timestamps: true }
);

enumSchema.statics.paginate = async function (query, options) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const countPromise = this.countDocuments(query).exec();
  const documentsPromise = this.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .exec();

  const [total, documents] = await Promise.all([
    countPromise,
    documentsPromise,
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;

  return {
    page: page,
    limit: limit,
    total: total,
    totalPages: totalPages,
    hasNextPage: hasNextPage,
    data: documents,
  };
};

const enumModel = mongoose.model("qualification", enumSchema);

module.exports = enumModel;
