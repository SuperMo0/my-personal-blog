import 'dotenv/config';
import app from './app.ts';

app.listen(process.env.PORT, () => {
    console.log(`server is listening on port ${process.env.PORT}`);
});
