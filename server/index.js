// server/index.js
import { OpenAI } from 'openai';

import path from "path";
import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config()

const app = express();
app.use(express.json({ limit: '5mb' }));


const acceptedOrigins = [process.env.VITE_FRONTEND_URL];

app.use(cors({origin: (origin, callback) => {
    // Allow requests from the specified origins or if no origin is provided (e.g., for
    if (!origin || acceptedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS policy violation: Origin not allowed'));

}}));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sendImageToGPT = async (image) => {
    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                role: 'user',
                content: [
                    {
                    type: 'text',
                    text:
                        'You are being shown a receipt from a restaurant. ' +
                        'Parse the receipt lines into a valid JSON using this schema: ' +
                        'items: ["{ "Quantity": (float), "Name": (string), "Price": (float) }"], tax: (float), tip: (float)], ' +
                        'Where Price is the cost of 1 of the line item, NOT for the total quantity' +
                        'Return every line from the receipt, do not try to group things,' +
                        'do not include any extra text or formatting or Markdown -- ONLY the JSON.'
                    },
                    {
                    type: 'image_url',
                    image_url: {
                        url: image,
                    }
                    },
                ],
                },
            ],
        });
        return response
    }
    catch (error) {
        console.error('Error sending image to GPT:', error);
        throw error;
    }
};

app.post('/parsereceipt', async (req, res) => {
  const chatGPTfullresponse = await sendImageToGPT(req.body.image);
  const messageContentString = chatGPTfullresponse.choices[0].message.content;
  const messageContentStringCleaned = messageContentString.replace(/```json|```/g, '').trim();
  const messageContentJSON = JSON.parse(messageContentStringCleaned);

  res.json(messageContentJSON);

});

app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(3000, () => {
});


// await new Promise(resolve => setTimeout(resolve, 500));
//   const messageContentJSON = {
//    items: [
//      { Quantity: 2, Name: 'Old F Makers', Price: 22.00 },
//      { Quantity: 1, Name: 'Purple Rain', Price: 24.00 },
//      { Quantity: 1, Name: 'Blushing Geisha', Price: 25.00 },
//      { Quantity: 1, Name: 'Gl Fiol Prosecco', Price: 18.00 },
//      { Quantity: 1, Name: 'Salmon Tacos', Price: 24.00 },
//      { Quantity: 1, Name: '6 Oysters', Price: 36.00 },
//      { Quantity: 1, Name: 'Chicken Sliders', Price: 27.00 },
//      { Quantity: 1, Name: 'Nitr Esp Martini', Price: 22.00 }
//    ],
//    tax: 28.6,
//    tip: 0.00
//  };

