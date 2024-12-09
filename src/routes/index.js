const express = require('express');
const authRoutes = require('./auth');
const moodRoutes = require('./mood');
const activitiesRoutes = require('./activities');
const remindersRoutes = require('./reminders');
const exercisesRoutes = require('./exercises');
const emergencyRoutes = require('./emergency');
const chatRoutes = require('./chat');
const infoRoutes = require('./info');

const router = express.Router();

// Auth routes (signup, login)
router.use('/auth', authRoutes);

// Other routes
router.use('/mood-logs', moodRoutes);
router.use('/activity-logs', activitiesRoutes);
router.use('/reminders', remindersRoutes);
router.use('/exercises', exercisesRoutes);
router.use('/emergency-resources', emergencyRoutes);
router.use('/chat-messages', chatRoutes);
router.use('/info', infoRoutes);

module.exports = router;
