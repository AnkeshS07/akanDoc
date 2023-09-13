
const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema({

    type:{type:Number,default:1},
    name:String,
    status:{type:Number,default:1}
}, { timestamps: true });

/* The `skillSchema.statics.paginate` function is a custom static method added to the `skillSchema`
schema. */
skillSchema.statics.paginate = async function (query, options) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
  
   /* The code block you provided is a custom static method called `paginate` that is added to the
   `skillSchema` schema in Mongoose. This method is used to implement pagination functionality for
   querying documents in the `skill` collection. */
    const countPromise = this.countDocuments(query).exec();
    const documentsPromise = this.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  
    const [total, documents] = await Promise.all([countPromise, documentsPromise]);
  
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
  
const skillModel = mongoose.model("skill", skillSchema);

module.exports = skillModel;
