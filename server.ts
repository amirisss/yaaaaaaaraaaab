import express from 'express';
import path from 'path';
import cors from 'cors';
import fs from 'fs/promises';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(process.cwd(), 'database.json');

let offers: any[] = [];

async function initDb() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    offers = JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Seed initial data if empty
      offers = [
        {
          id: 1,
          title: 'Out Skills 🇬🇧',
          description: 'Outsourcing Skill is hiring USA Telesales Account with Flexibility and Big Rewards!\n🤙 Calling all undergraduates, graduates, and foreigners (male and female)!\n\n➡ NO experience is needed.\n➡ paid training 200 per day\n➡ fixed US shifts (3 PM–12 AM): Females can leave at 11 PM.\n➡️ working from home after one month\n➡ Weekends Off (Saturday and Sunday): Recharge and relax! 🤩🥳\n📍Location: maadi, Madint Nasr Egypt\n➡ Salary from 10,000 to 12,000 + Unlimited Monthly Commission 🤑💸\n➡ Weekly Commission Payouts + Valuable Gifts\n➡ 6-Month Loyalty Bonus\nSpiffs and Daily Recognition: ➡ Get rewarded for top performance!\n🚗 Safe Uber Allowance (for female employees) for the first month.\n\nReady to take control of your future? 🤩🫣\nIf you are interested, send a VN introducing yourself in english for at least 2 minutes',
          requirements: '',
          benefits: '',
          process: '1 Month from site &after all WFH',
          nationality: 'Egyptian & forigners',
          maxAge: 'From 16 To 30',
          interviewTime: 'Monday ~ Friday (4PM ~ 6 PM)',
          trainingPeriod: '2 Week\'s',
          language: 'English B2',
          graduationStatus: 'ANY',
          shifts: 'Fixed US shift (3PM ~ 12PM)',
          location: 'Maadi',
          status: 'active'
        },
        {
          id: 2,
          title: 'Concentrix English 🇬🇧',
          description: 'Are you a fluent English speaker with call center experience? This is your chance to join one of the leading companies in customer experience solutions',
          requirements: '- 🇪🇬 Egyptians only\n- 🎓 Graduates only\n- ❌ No undergrads or fresh grads ❌\n- ✅ Maximum age: 45 years\n- 🇬🇧 English level: Solid B2 / B2+ / C1',
          benefits: '- 💰 Salary up to 18K EGP Gross (depending on the account)\n- 🌙 Night & overnight shifts\n- 📚 Paid training\n- 🗓️ 5 working days + 2 days off\n- 🏥 Social & medical insurance\n- 🚐 Transportation provided — Door to door transportation after 10 PM for ladies',
          process: 'Online then On-Site Interview',
          nationality: 'Egyptian',
          maxAge: '40',
          interviewTime: 'Monday ~ Friday',
          trainingPeriod: '2 Weeks',
          language: 'English B1+',
          graduationStatus: 'Grad',
          shifts: 'Rotational',
          location: '6th October/Maadi/New Cairo',
          status: 'active'
        },
        {
          id: 3,
          title: 'Teleperformance English 🇬🇧',
          description: '⭐️ Job Details:\n- Nature of work: Call Center',
          requirements: '🇬🇧 B2/C1 English\n🎓 Grads only\n🇪🇬 Egyptians only\n🔄 Flexibility with rotational shifts',
          benefits: '💰 Salary up to 19K\n🎓 Paid training\n🩺 Medical and Social insurance\n🚌 Transportation Provided\n💪 Gym access\n🛍️ Discounts in many shopping stores\n📱 Line for minutes and internet\n💶 KPIs paid in Euro, meaning your salary increases whenever the Euro rate changes',
          process: 'Online then On-Site Interview',
          nationality: 'Egyptian',
          maxAge: '45',
          interviewTime: 'Sunday ~ Thursday',
          trainingPeriod: '1 Month',
          language: 'English B2',
          graduationStatus: 'Grads',
          shifts: 'Rotational',
          location: 'Qatamia',
          status: 'active'
        }
      ];
      await saveDb();
    }
  }
}

async function saveDb() {
  await fs.writeFile(DB_FILE, JSON.stringify(offers, null, 2));
}

const PASSCODE = '872004872004';

const authMiddleware = (req: any, res: any, next: any) => {
  const code = req.headers['x-passcode'];
  if (code === PASSCODE) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/api/auth', (req, res) => {
  const { passcode } = req.body;
  if (passcode === PASSCODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid passcode' });
  }
});

app.get('/api/offers', async (req, res) => {
  try {
    res.json(offers);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/offers', authMiddleware, async (req, res) => {
  try {
    const newOffer = { ...req.body, id: Date.now(), status: req.body.status || 'active' };
    offers.push(newOffer);
    await saveDb();
    res.json({ id: newOffer.id });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/offers/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const index = offers.findIndex(o => o.id === Number(id));
    if (index !== -1) {
      offers[index] = { ...offers[index], ...req.body, id: Number(id) };
      await saveDb();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/offers/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    offers = offers.filter(o => o.id !== Number(id));
    await saveDb();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

async function startServer() {
  await initDb();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
