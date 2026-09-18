import { StatusCode } from '../enums/status-code.js';
import Product from '../models/Product.js';
import { calculateOffsetAndLimit } from '../utils/helper.js';

import type { FilterQuery } from 'mongoose';
import fetch from 'node-fetch';


export const getFoodList = async (req, res) => {
  const searchValue = req.query['search_expression'];
  const currentPage = req.query['page'];

  const offsetAndLimit = calculateOffsetAndLimit(currentPage);

  const where: FilterQuery<any>[] = [];

  if (searchValue) {
    const searchValues = searchValue.replaceAll('.', '\\.').split(' ');
    searchValues.forEach(sv => {
      where.push({ name: { $regex: sv, $options: 'i' } });
    });
  }

  const query: FilterQuery<any> = where.length ? { $or: [...where] } : {};

  const products = await Product.find(query, {}, { sort: { name: -1 } })
    .limit(offsetAndLimit.limit)
    .skip(offsetAndLimit.offset)
    .exec();

  const count = await Product.countDocuments(query).exec();

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
