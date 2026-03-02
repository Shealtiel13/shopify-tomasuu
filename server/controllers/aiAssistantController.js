const axios = require('axios');

const OPENAI_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
  'OpenAI-Beta': 'assistants=v2',
};

exports.create = async (req, res) => {
  try {
    const { instructions, name, tools, model } = req.body;

    const response = await axios.post(
      'https://api.openai.com/v1/assistants',
      { instructions, name, tools, model },
      { headers: OPENAI_HEADERS }
    );

    res.status(201).json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.error?.message || err.message });
  }
};
