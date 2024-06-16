import app from './app';
import env from './config/env';

app.listen(env.API_PORT, () => {
  console.log(`http://localhost:${env.API_PORT}`);
});
