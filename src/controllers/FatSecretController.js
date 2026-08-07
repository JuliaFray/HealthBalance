import fetch from 'node-fetch';


export const getFoodList = async (req, res) => {
  const search = req.query['search_expression'];
  const page = req.query['page'];

  fetch(`${process.env.DIET_PLAN_URL}.org/cgi/search.pl?search_terms=${search}
  &lc=ru&cc=ru&json=1&page=${page}&page_size=20
  &fields=id,nutriments,nutriscore,product_name,product_name_ru,serving_size,image_front_thumb_url`, {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + btoa(`${process.env.DIET_PLAN_LOGIN}:${process.env.DIET_PLAN_PASS}`),
      'Accept-Language': 'ru',
    },
  })
    .then((response) => response.json())
    .then((json) => {
      res.json({
        resultCode: 0,
        data: json,
      });
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
