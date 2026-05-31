import express from 'express';
import { query, get } from '../db/database.js';
import { authenticate } from '../middleware/middleware.js';

const router = express.Router();

router.get('/overview', (req, res) => {
  const totalJobs = get('SELECT COUNT(*) as c FROM jobs').c;
  const totalUsers = get('SELECT COUNT(*) as c FROM users').c;
  const totalApps = get('SELECT COUNT(*) as c FROM applications').c;
  const seekers = get("SELECT COUNT(*) as c FROM users WHERE role='seeker'").c;
  const employers = get("SELECT COUNT(*) as c FROM users WHERE role='employer'").c;
  const statusDist = query('SELECT status, COUNT(*) as count FROM applications GROUP BY status');
  const topCompanies = query('SELECT company, COUNT(*) as jobs FROM jobs GROUP BY company ORDER BY jobs DESC LIMIT 5');
  res.json({ totals:{jobs:totalJobs,users:totalUsers,applications:totalApps,seekers,employers}, statusDistribution:statusDist, topCompanies });
});

router.get('/seeker', authenticate, (req, res) => {
  const apps = query(`SELECT a.*,j.title as job_title,j.company,j.salary_min,j.salary_max FROM applications a JOIN jobs j ON a.job_id=j.id WHERE a.user_id=?`,[req.user.userId]);
  const statusCounts={};
  apps.forEach(a=>{statusCounts[a.status]=(statusCounts[a.status]||0)+1;});
  const avgSalary = apps.length>0 ? Math.round(apps.reduce((s,a)=>s+((a.salary_min+a.salary_max)/2),0)/apps.length) : 0;
  const responseRate = apps.length>0 ? Math.round((apps.filter(a=>a.status!=='unopened').length/apps.length)*100) : 0;
  const timeline = query(`SELECT date(applied_at) as date, COUNT(*) as count FROM applications WHERE user_id=? GROUP BY date(applied_at) ORDER BY date DESC LIMIT 30`,[req.user.userId]);
  res.json({totalApplications:apps.length,statusBreakdown:statusCounts,averageSalary:avgSalary,responseRate,applicationTimeline:timeline,recentApplications:apps.slice(0,5)});
});

router.get('/employer', authenticate, (req, res) => {
  const pipeline = query(`SELECT a.status, COUNT(*) as count, j.title as job_title FROM applications a JOIN jobs j ON a.job_id=j.id GROUP BY a.status, j.id ORDER BY a.status`);
  const totalApps = get('SELECT COUNT(*) as c FROM applications').c;
  const hired = get("SELECT COUNT(*) as c FROM applications WHERE status='accepted'").c;
  const conversionRate = totalApps>0 ? Math.round((hired/totalApps)*100) : 0;
  const topJobs = query(`SELECT j.title,j.company,COUNT(a.id) as applicants FROM jobs j LEFT JOIN applications a ON j.id=a.job_id GROUP BY j.id ORDER BY applicants DESC LIMIT 5`);
  res.json({pipeline,conversionRate,averageTimeToHire:14,topJobs});
});

export default router;
