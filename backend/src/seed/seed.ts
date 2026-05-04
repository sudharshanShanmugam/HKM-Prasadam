import 'dotenv/config';
import mongoose from 'mongoose';
import PrasadamBooking from '../models/PrasadamBooking';
import PartyEnquiry    from '../models/PartyEnquiry';
import InternalOrder   from '../models/InternalOrder';
import SlotDate        from '../models/SlotDate';
import MealMenu        from '../models/MealMenu';
import Festival        from '../models/Festival';

const prasadamBookings = [
  { id:'HKM-04905', name:'Ananya Krishnan',  mobile:'9876543210', location:'Thiruvanmiyur', meals:{ Breakfast:0, Lunch:3, Dinner:0 }, date:'2026-05-07', total:120, status:'approved' },
  { id:'HKM-04904', name:'Ananya Krishnan',  mobile:'9876543210', location:'NLBR',          meals:{ Breakfast:2, Lunch:0, Dinner:0 }, date:'2026-05-02', total:80,  status:'approved' },
  { id:'HKM-04903', name:'Gopika Devi',      mobile:'9845012345', location:'Thiruvanmiyur', meals:{ Breakfast:0, Lunch:3, Dinner:0 }, date:'2026-05-07', total:120, status:'approved' },
  { id:'HKM-04902', name:'Gopika Devi',      mobile:'9845012345', location:'NLBR',          meals:{ Breakfast:2, Lunch:0, Dinner:0 }, date:'2026-05-11', total:80,  status:'pending'  },
  { id:'HKM-04901', name:'Tulasi Priya',     mobile:'9198765488', location:'Thiruvanmiyur', meals:{ Breakfast:0, Lunch:4, Dinner:0 }, date:'2026-05-05', total:100, status:'approved' },
  { id:'HKM-04900', name:'Radha Mohan',      mobile:'8867452301', location:'NLBR',          meals:{ Breakfast:0, Lunch:0, Dinner:2 }, date:'2026-05-15', total:70,  status:'pending'  },
];

const partyEnquiries = [
  { id:'BDY-01006', name:'Priya Venkataraman',  mobile:'9876543210', eventDate:'2026-05-18', address:'14, Lotus Colony, Velachery, Chennai - 600042',  meals:{ Breakfast:0, Lunch:50, Dinner:50 }, preferredMenu:'Sambar Rice, Rasam Rice, Curd Rice, Payasam', preferredPrice:250, mealPrices:{ Breakfast:0, Lunch:120, Dinner:130 }, status:'accepted', paid:true  },
  { id:'BDY-01005', name:'Karthik Subramanian', mobile:'9845012345', eventDate:'2026-05-22', address:'27, Anna Nagar East, Chennai - 600102',           meals:{ Breakfast:30, Lunch:0, Dinner:0 }, preferredMenu:'Idli, Vada, Sambar, Chutney',                preferredPrice:150, mealPrices:{ Breakfast:80, Lunch:0, Dinner:0 },  status:'pending',  paid:false },
  { id:'BDY-01004', name:'Meenakshi Iyer',      mobile:'9845012345', eventDate:'2026-05-10', address:'12 Anna Nagar, Chennai - 600040',                 meals:{ Breakfast:0, Lunch:25, Dinner:25 }, preferredMenu:'Special feast',                              preferredPrice:300, confirmedMenu:'Sambar Rice, Rasam, Kootu, Payasam', confirmedPrice:280, mealPrices:{ Breakfast:0, Lunch:140, Dinner:140 }, status:'accepted', paid:false },
  { id:'BDY-01003', name:'Gopika Devi',         mobile:'9845012345', eventDate:'2026-05-15', address:'34 T Nagar, Chennai - 600017',                    meals:{ Breakfast:0, Lunch:0, Dinner:40 }, preferredMenu:'Chapati, Dal, Sabzi',                        preferredPrice:180, mealPrices:{ Breakfast:0, Lunch:0, Dinner:100 }, status:'pending',  paid:false },
];

const internalOrders = [
  { id:'INT-0012', name:'Murali Das',       mobile:'9845012345', date:'2026-05-15', dept:'Security',              meal:'Lunch',     count:10, location:'Security Block, Gate 2',           accepted:false, delivered:false },
  { id:'INT-0011', name:'Krishnapriya R.',  mobile:'9876543210', date:'2026-05-11', dept:'Deity Department',      meal:'Breakfast', count:25, location:'Deity Dept Room, 1st Floor',        accepted:true,  delivered:false },
  { id:'INT-0010', name:'Vishnu Prasad',    mobile:'9745123444', date:'2026-05-11', dept:'Education / Gurukul',   meal:'Lunch',     count:40, location:'Gurukul Dining Hall',               accepted:true,  delivered:false },
  { id:'INT-0009', name:'Murali Das',       mobile:'9845012345', date:'2026-05-07', dept:'Security',              meal:'Dinner',    count:8,  location:'Main Entrance, Security Cabin',     accepted:true,  delivered:false },
  { id:'INT-0008', name:'Krishnapriya R.',  mobile:'9876543210', date:'2026-05-07', dept:'Deity Department',      meal:'Lunch',     count:20, location:'Deity Dept Room, 1st Floor',        accepted:true,  delivered:true  },
  { id:'INT-0007', name:'Murali Das',       mobile:'9845012345', date:'2026-05-02', dept:'Security',              meal:'Lunch',     count:6,  location:'Security Block, Gate 2',            accepted:true,  delivered:true  },
  { id:'INT-0006', name:'Annapurna Devi',   mobile:'9790001122', date:'2026-05-07', dept:'Guest House',           meal:'Breakfast', count:15, location:'Guest House Reception',             accepted:false, delivered:false },
  { id:'INT-0005', name:'Vishnu Prasad',    mobile:'9745123444', date:'2026-05-05', dept:'Education / Gurukul',   meal:'Dinner',    count:35, location:'Gurukul Dining Hall',               accepted:true,  delivered:true  },
  { id:'INT-0004', name:'Radhika S.',       mobile:'8867452301', date:'2026-05-05', dept:'Outreach / Sankirtan',  meal:'Lunch',     count:10, location:'Sankirtan Office, Ground Floor',    accepted:true,  delivered:false },
  { id:'INT-0003', name:'Govinda Swami',    mobile:'9198765488', date:'2026-05-02', dept:'Temple Administration', meal:'Breakfast', count:50, location:'Admin Block, Conference Room',      accepted:true,  delivered:true  },
  { id:'INT-0002', name:'Tulasi Archana',   mobile:'7654321098', date:'2026-05-02', dept:'Accounts',              meal:'Lunch',     count:6,  location:'Accounts Office, 2nd Floor',       accepted:false, delivered:false },
  { id:'INT-0001', name:'Hari Bhakta',      mobile:'9876501234', date:'2026-04-30', dept:'IT / Media',            meal:'Dinner',    count:12, location:'IT Room, 3rd Floor',                accepted:true,  delivered:true  },
];

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
  ]);
  console.log('Cleared existing data');

  await PrasadamBooking.insertMany(prasadamBookings);
  await PartyEnquiry.insertMany(partyEnquiries);
  await InternalOrder.insertMany(internalOrders);
  await SlotDate.insertMany(slotDates);
  await MealMenu.insertMany(mealMenus);
  await Festival.insertMany(festivals);

  console.log('✅ Seed complete');
  console.log(`  Prasadam bookings : ${prasadamBookings.length}`);
  console.log(`  Party enquiries   : ${partyEnquiries.length}`);
  console.log(`  Internal orders   : ${internalOrders.length}`);
  console.log(`  Slot dates        : ${slotDates.length}`);
  console.log(`  Meal menus        : ${mealMenus.length}`);
  console.log(`  Festivals         : ${festivals.length}`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
