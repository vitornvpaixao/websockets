import path from "path";
import dotenv from "dotenv";

interface Config {
    PORT: number;
    HOST: string
}

const env = 'dev';
const envPath = path.resolve(process.cwd(), "config", `.env.${env}`);
dotenv.config({ path: envPath });

// build and export typed config
export const config: Config = {
  PORT: parseInt(process.env.PORT ?? '3000', 10),
  HOST: process.env.HOST ?? 'localhost'
};
