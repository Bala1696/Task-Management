const express = require('express');
const session = require('express-session');
const User = require('./model/userModel');
const path = require('path');
const cors = require('cors');
require('./config/mongoConnector');
const passport = require('./middleware/auth');
const userRouting = require('./routes/userRoute');
const projectRouting = require('./routes/projectRoute');
const orgRouting = require('./routes/orgRoute');
const taskRouting = require('./routes/taskRoute');
const commentRouting = require('./routes/commentRoute');
const leaveRouting = require('./routes/leaveRoute');
const timesheetRouting = require('./routes/timesheetRoute');
const roleRouting=require('./routes/roleRoute')
const moduleRouting = require('./routes/moduleRoute');
const functionalityRouting=require('./routes/functionalityRoute')
const permissionRouting=require('./routes/permissionRoute')
const app = express();

app.use(session({
    secret:process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});



app.use('/api', userRouting);
app.use('/api', projectRouting);
app.use('/api', orgRouting);
app.use('/api', taskRouting);
app.use('/api', commentRouting);
app.use('/api', leaveRouting);
app.use('/api', timesheetRouting);
app.use('/api', roleRouting)
app.use('/api', moduleRouting)
app.use('/api', functionalityRouting)
app.use('/api', permissionRouting)


app.listen(1731, ()=>{
    console.log('Server Connected');
});
