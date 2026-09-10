import type { FilterQuery } from 'mongoose';
import fetch from 'node-fetch';

import Post from '#models/Post.js';
import Product from '#models/Product.js';

import { StatusCode } from '#enums/status-code.enum.ts';

import { calculateOffsetAndLimit } from '#utils/helper.js';

export const getFoodList = async (req, res) => {
  let searchValue = req.query['search_expression'];
  const currentPage = req.query['page'];

  let offsetAndLimit = calculateOffsetAndLimit(currentPage);

  const where: FilterQuery<any>[] = [];

  if (searchValue) {
    searchValue = searchValue.replaceAll('.', '\\.');
    where.push({ name: { $regex: searchValue, $options: 'i' } });
  }

  let query: FilterQuery<any> = where.length ? { $and: [...where] } : {};

  const products = await Product.find(query, {}, { sort: { createdAt: -1 } })
    .limit(offsetAndLimit.limit)
    .skip(offsetAndLimit.offset)
    .exec();

  let count = await Product.countDocuments(query).exec();

  res.status(StatusCode.Success).json({
    data: products,
    totalCount: count,
  });
};

export const getFoodById = async (req, res) => {
  const foodId = req.params.id;

  fetch(`${process.env.DIET_PLAN_URL}.net/api/v3/product/${foodId}?fields=nutriments,nutriscore,product_name,serving_size,image_front_small_url&lc=ru&cc=ru`, {
    method: 'GET',
    headers: { 'Accept-Language': 'ru' },
  })
    .then((response) => response.json())
    .then((json) => {
      res.json({
        resultCode: 0,
        data: json,
      });
    });
};
