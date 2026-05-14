import mongoose from 'mongoose';
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://duonghd241004_db_user:L1ZUIkHmiJ6kVlqz@ac-iwz7o1o-shard-00-00.sf60kie.mongodb.net:27017,ac-iwz7o1o-shard-00-01.sf60kie.mongodb.net:27017,ac-iwz7o1o-shard-00-02.sf60kie.mongodb.net:27017/?ssl=true&replicaSet=atlas-b0fnp5-shard-0&authSource=admin&appName=Cluster0/RealState')
    .then(() => {
      console.log('Connected to MongoDB');
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};
export default connectDB;