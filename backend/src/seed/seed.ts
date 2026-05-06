import 'dotenv/config';
import mongoose from 'mongoose';
import PrasadamBooking from '../models/PrasadamBooking';
import PartyEnquiry    from '../models/PartyEnquiry';
import InternalOrder   from '../models/InternalOrder';
import SlotDate        from '../models/SlotDate';
import MealMenu        from '../models/MealMenu';
import Festival        from '../models/Festival';
import Counter         from '../models/Counter';

const slotDates = [
  { date:'2026-05-02', meals:['Breakfast','Lunch','Dinner'] },
  { date:'2026-05-05', meals:['Lunch','Dinner'] },
  { date:'2026-05-07', meals:['Breakfast','Dinner'] },
  { date:'2026-05-09', meals:['Dinner'] },
  { date:'2026-05-11', meals:['Breakfast','Lunch','Dinner'], isFestival:true, festivalName:'Parashurama Jayanti' },
  { date:'2026-05-13', meals:['Dinner'] },
  { date:'2026-05-15', meals:['Lunch','Dinner'] },
  { date:'2026-05-16', meals:['Breakfast','Dinner'] },
  { date:'2026-05-18', meals:['Lunch','Dinner'] },
  { date:'2026-05-20', meals:['Breakfast','Dinner'] },
  { date:'2026-05-21', meals:['Dinner'] },
  { date:'2026-05-23', meals:['Breakfast','Lunch','Dinner'] },
  { date:'2026-05-25', meals:['Dinner'] },
  { date:'2026-05-26', meals:['Lunch','Dinner'] },
  { date:'2026-05-28', meals:['Breakfast','Dinner'] },
  { date:'2026-05-29', meals:['Lunch','Dinner'] },
  { date:'2026-05-30', meals:['Breakfast','Dinner'] },
];

const mealMenus = [
  {
    date: '2026-05-11',
    meals: {
      Breakfast: 'Idli & Sambar\nVen Pongal\nCoconut Chutney\nFilter Coffee',
      Lunch:     'Steamed Rice\nDal Tadka\nMixed Veg Sabzi\nRasam\nPayasam',
      Dinner:    'Chapati\nPaneer Butter Masala\nDal Fry\nRice\nGulab Jamun',
    },
  },
];

const festivals = [
  { date:'2026-05-03', name:'Hanuman Jayanti',             description:'Appearance of Lord Hanuman',      icon:'🙏' },
  { date:'2026-05-04', name:'Sunday Special',              description:'Weekly Sunday prasadam feast',     icon:'☀️' },
  { date:'2026-05-10', name:'Mohini Ekadashi',             description:'Auspicious Ekadashi fasting day',  icon:'🌙' },
  { date:'2026-05-11', name:'Parashurama Jayanti',         description:'Appearance of Lord Parashurama',   icon:'🙏' },
  { date:'2026-05-24', name:'Narasimha Chaturdashi',       description:'Appearance of Lord Narasimhadeva', icon:'🦁' },
  { date:'2026-05-25', name:'Srila Prabhupada Vyasa Puja', description:'Celebration of Founder-Acharya',  icon:'📿' },
];

async function seed(): Promise<void> {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to MongoDB');

  await Promise.all([
    PrasadamBooking.deleteMany({}),
    PartyEnquiry.deleteMany({}),
    InternalOrder.deleteMany({}),
    SlotDate.deleteMany({}),
    MealMenu.deleteMany({}),
    Festival.deleteMany({}),
    Counter.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  await SlotDate.insertMany(slotDates);
  await MealMenu.insertMany(mealMenus);
  await Festival.insertMany(festivals);

  console.log('✅ Seed complete');
  console.log(`  Slot dates : ${slotDates.length}`);
  console.log(`  Meal menus : ${mealMenus.length}`);
  console.log(`  Festivals  : ${festivals.length}`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
