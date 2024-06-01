import data from '/public/data/district.json'

export default function handler(req, res) {
  res.status(200).json(data);
}