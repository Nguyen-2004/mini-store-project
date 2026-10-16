export const sendData = (res, data, status = 200) =>
  res.status(status).json({ data });

export const pageInfo = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
});
