import mongoose from 'mongoose'
const connectMongoDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MONGODB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log(`Connection Error - MONGODB: ${error.message}`);
        process.exit(1);
    }
}

export default connectMongoDB;