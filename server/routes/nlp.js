import express from 'express';
import { query, get } from '../db/database.js';
import { authenticate } from '../middleware/middleware.js';
import { run } from '../db/database.js';

const router = express.Router();

const SKILL_KEYWORDS = ['react','vue','angular','svelte','next.js','nuxt','javascript','typescript','python','java','go','rust','node.js','express','fastapi','django','flask','graphql','rest','grpc','websocket','postgresql','mysql','mongodb','redis','sqlite','aws','gcp','azure','docker','kubernetes','terraform','ansible','html','css','tailwind','figma','pytorch','tensorflow','scikit-learn','nlp','machine learning','git','agile','testing','jest','cypress','microservices','distributed systems'];

const STOPWORDS = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','i','you','we','they','it','my','your','our','their','its','this','that','these','those','which','who','what','how','when','as','if','so','not','no','more','also','can','than','then']);

function extractSkills(text) {
  const lower = text.toLowerCase();
  return SKILL_KEYWORDS.filter(s => lower.includes(s));
}

function computeMatchScore(resumeSkills, jobTags) {
  if (!jobTags||!jobTags.length) return 50;
  const normalised = jobTags.map(t=>t.toLowerCase());
  const matches = normalised.filter(tag => resumeSkills.some(s=>s.toLowerCase().includes(tag)||tag.includes(s.toLowerCase())));
  return Math.min(99, Math.round((matches.length/normalised.length)*100 + Math.random()*8));
}

function keywordFrequency(text, topN=15) {
  const words = text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOPWORDS.has(w));
  const freq = {};
  words.forEach(w=>{freq[w]=(freq[w]||0)+1;});
  return Object.entries(freq).sort(([,a],[,b])=>b-a).slice(0,topN).map(([word,count])=>({word,count}));
}

router.post('/analyse-resume', authenticate, (req, res) => {
  const { resume_text, job_id } = req.body;
  if (!resume_text||resume_text.trim().length<50) return res.status(400).json({error:'Please provide a resume (min 50 characters)'});

  const foundSkills = extractSkills(resume_text);
  const keywords = keywordFrequency(resume_text);
  let matchScore=null, missingSkills=[], jobTitle=null;

  if (job_id) {
    const job = get('SELECT * FROM jobs WHERE id=?',[job_id]);
    if (job) {
      const jobTags = JSON.parse(job.tags||'[]');
      matchScore = computeMatchScore(foundSkills, jobTags);
      missingSkills = jobTags.filter(tag=>!foundSkills.some(s=>s.toLowerCase().includes(tag.toLowerCase())||tag.toLowerCase().includes(s.toLowerCase())));
      jobTitle = job.title;
    }
  }

  const suggestions=[];
  if (foundSkills.length<5) suggestions.push('Add more technical skills — recruiters often keyword-search resumes.');
  if (!resume_text.toLowerCase().includes('experience')) suggestions.push('Include a dedicated "Experience" section with bullet-pointed achievements.');
  if (resume_text.length<500) suggestions.push('Your resume seems short. Consider expanding each role with measurable outcomes.');
  if (missingSkills.length>0) suggestions.push(`Consider gaining experience in: ${missingSkills.slice(0,3).join(', ')}.`);
  if (!resume_text.toLowerCase().includes('github')&&!resume_text.toLowerCase().includes('portfolio')) suggestions.push('Add a link to your GitHub profile or portfolio website.');

  const analysis = {skills:foundSkills,keywords,matchScore,missingSkills,suggestions,jobTitle};
  run('INSERT INTO resume_analyses (user_id,resume_text,analysis) VALUES (?,?,?)',[req.user.userId,resume_text.slice(0,5000),JSON.stringify(analysis)]);
  res.json({analysis});
});

router.post('/match-jobs', (req, res) => {
  const {skills=[]} = req.body;
  const jobs = query('SELECT * FROM jobs ORDER BY id DESC');
  const ranked = jobs.map(job=>{
    const tags = JSON.parse(job.tags||'[]');
    return {id:job.id,title:job.title,company:job.company,logo:job.logo,location:job.location,type:job.type,salary:job.salary,experience:job.experience,tags,match:computeMatchScore(skills,tags)};
  }).sort((a,b)=>b.match-a.match).slice(0,10);
  res.json({jobs:ranked});
});

router.post('/interview-coach', (req, res) => {
  const {job_title='Software Engineer',skills=[],level='Mid-level'} = req.body;
  const questions=[
    {category:'Behavioural',question:`Tell me about a challenging project you worked on as a ${job_title}. How did you handle it?`,hint:'Use the STAR method: Situation, Task, Action, Result.'},
    {category:'Behavioural',question:'Describe a time you disagreed with a technical decision. What did you do?',hint:'Focus on your reasoning process and how you communicated respectfully.'},
  ];
  const techQ={'react':"Explain the difference between useEffect and useLayoutEffect, and when you'd use each.",'typescript':"How does TypeScript's type system help prevent runtime errors? Give an example.",'node.js':'How does Node.js handle concurrent requests despite being single-threaded?','postgresql':'Explain the difference between an index and a composite index. When would you avoid using one?','aws':'Walk me through how you would design a highly available architecture on AWS.','docker':'What is the difference between a Docker image and a container?','kubernetes':'How would you handle a pod that keeps crashing in Kubernetes?','graphql':'What is the N+1 query problem in GraphQL and how do you solve it?','python':"Explain Python's GIL and its implications for concurrent programming.",'machine learning':'What is overfitting and what techniques do you use to prevent it?'};
  for (const skill of skills.slice(0,3)) {
    const key = Object.keys(techQ).find(k=>skill.toLowerCase().includes(k));
    if (key) questions.push({category:'Technical',question:techQ[key],hint:'Demonstrate practical experience, not just theoretical knowledge.'});
  }
  if (level==='Senior'||level==='Lead') questions.push({category:'System Design',question:'Design a scalable job board system. Walk through the database schema, APIs, and caching strategy.',hint:'Start with requirements, then data model, then API design, then scaling.'});
  questions.push({category:'Culture Fit',question:'How do you stay current with new technologies in your field?',hint:'Mention specific resources: blogs, conferences, side projects, open source.'});
  res.json({questions,job_title,level});
});

router.get('/trending-skills', (req, res) => {
  const jobs = query('SELECT tags FROM jobs');
  const freq={};
  jobs.forEach(job=>{ const tags=JSON.parse(job.tags||'[]'); tags.forEach(tag=>{freq[tag]=(freq[tag]||0)+1;}); });
  const trending=Object.entries(freq).sort(([,a],[,b])=>b-a).map(([skill,count])=>({skill,count,demand:Math.round((count/jobs.length)*100)}));
  res.json({trending});
});

export default router;
