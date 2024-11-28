const express=require('express');
const { handleLoginDetails } = require('../controllers/login');

const router=express.Router();

router.post('/',handleLoginDetails);


module.exports=router;