// server/index.js
import { OpenAI } from 'openai';

import express from 'express';
import cors from 'cors';

import dotenv from 'dotenv';
dotenv.config()

const app = express();
app.use(express.json({ limit: '5mb' }));

const acceptedOrigins = [process.env.VITE_FRONTEND_URL];

app.use(cors({origin: (origin, callback) => {
    // Allow requests from the specified origins or if no origin is provided (e.g., for
    if (acceptedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('CORS policy violation: Origin not allowed'));

}}));
app.use(express.json());

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
                        'You are being shown a receipt from a restaurant. Please correctly parse out all items, quantity, tax, and tip and prices in the following receipt. ' +
                        'Return the extracted information in a json using this schema: ' +
                        'items: ["{ "Quantity": (float), "Name": (string), "Price": (float) }"], tax: (float), tip: (float), ' +
                        'where the price is the cost of 1 of each item, so price multiplied by quantity should equal the total amount charged for that item.' +
                        'Make sure to include all items, tax, and tip. if there is no tax or tip, set those values to 0.00. ' +
                        'Make sure all numbers are in decimal format with 2 decimal places. ' +
                        'Do not include markdown formatting, notes, or extra symbols.'
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
//   const chatGPTfullresponse = await sendImageToGPT(req.body.image);
//   const messageContentString = chatGPTfullresponse.choices[0].message.content;
//   const messageContentJSON = JSON.parse(messageContentString);
await new Promise(resolve => setTimeout(resolve, 500));
  const messageContentJSON = {
   items: [
     { Quantity: 2, Name: 'Old F Makers', Price: 22.00 },
     { Quantity: 1, Name: 'Purple Rain', Price: 24.00 },
     { Quantity: 1, Name: 'Blushing Geisha', Price: 25.00 },
     { Quantity: 1, Name: 'Gl Fiol Prosecco', Price: 18.00 },
     { Quantity: 1, Name: 'Salmon Tacos', Price: 24.00 },
     { Quantity: 1, Name: '6 Oysters', Price: 36.00 },
     { Quantity: 1, Name: 'Chicken Sliders', Price: 27.00 },
     { Quantity: 1, Name: 'Nitr Esp Martini', Price: 22.00 }
   ],
   tax: 28.6,
   tip: 0.00
 };
console.log(messageContentJSON);
  res.json(messageContentJSON);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});