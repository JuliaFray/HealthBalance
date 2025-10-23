export const getFoodList = async (req, res) => {
  const search = req.query['search_expression'];

  fetch(`${process.env.EXT_URL}.org/cgi/search.pl?json=1&search_terms=${search}&lc=ru&cc=ru`, {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + btoa(`${process.env.EXT_LOGIN}:${process.env.EXT_PASS}`),
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

  fetch(`${process.env.EXT_URL}.net/api/v3/product/${foodId}?fields=raw&lc=ru&cc=ru`, {
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
