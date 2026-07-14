INSERT INTO courses (id, slug, title, description, status, created_at, updated_at) VALUES
('course-cicd', 'ci-cd-foundations', 'CI/CD Foundations', 'Learn how code reaches production.', 'published', unixepoch(), unixepoch());

INSERT INTO modules (id, course_id, title, description, position, difficulty, estimated_minutes, status, created_at, updated_at) VALUES
('module-01','course-cicd','Software Delivery Basics','Follow code from laptop to production.',1,'Beginner',42,'published',unixepoch(),unixepoch()),
('module-02','course-cicd','Introduction to CI/CD','Understand CI, delivery, and deployment.',2,'Beginner',48,'published',unixepoch(),unixepoch()),
('module-03','course-cicd','Continuous Integration','Integrate small changes safely.',3,'Beginner',55,'published',unixepoch(),unixepoch()),
('module-04','course-cicd','Automated Testing','Use the right test and diagnose failures.',4,'Beginner',64,'published',unixepoch(),unixepoch()),
('module-05','course-cicd','Build Processes','Create reproducible artifacts.',5,'Beginner',51,'published',unixepoch(),unixepoch()),
('module-06','course-cicd','CI/CD Configuration Files','Write GitHub Actions workflows.',6,'Intermediate',78,'published',unixepoch(),unixepoch()),
('module-07','course-cicd','Continuous Delivery','Keep approved changes release-ready.',7,'Intermediate',58,'published',unixepoch(),unixepoch()),
('module-08','course-cicd','Continuous Deployment','Release automatically with guardrails.',8,'Intermediate',62,'published',unixepoch(),unixepoch()),
('module-09','course-cicd','Containers and Docker','Package applications consistently.',9,'Intermediate',66,'published',unixepoch(),unixepoch()),
('module-10','course-cicd','Cloud Deployments','Connect pipelines to hosting platforms.',10,'Intermediate',57,'published',unixepoch(),unixepoch()),
('module-11','course-cicd','Security in CI/CD','Protect credentials and supply chains.',11,'Intermediate',72,'published',unixepoch(),unixepoch()),
('module-12','course-cicd','Monitoring and Rollbacks','Detect and recover from unhealthy releases.',12,'Intermediate',69,'published',unixepoch(),unixepoch()),
('module-13','course-cicd','Advanced Pipeline Strategies','Optimize larger delivery systems.',13,'Advanced',84,'published',unixepoch(),unixepoch()),
('module-14','course-cicd','Final Pipeline Project','Build and operate a complete release workflow.',14,'Advanced',120,'published',unixepoch(),unixepoch());

INSERT INTO achievements (id, slug, title, description, xp, created_at, updated_at) VALUES
('ach-1','first-push','First push','Started the software delivery journey.',50,unixepoch(),unixepoch()),
('ach-2','green-build','Green build','Completed a pipeline without failures.',100,unixepoch(),unixepoch()),
('ach-3','pipeline-debugger','Pipeline debugger','Diagnosed and fixed a failed job.',150,unixepoch(),unixepoch()),
('ach-4','approval-granted','Approval granted','Reviewed a staging release.',100,unixepoch(),unixepoch()),
('ach-5','safe-rollback','Safe rollback','Recovered from an unhealthy deployment.',150,unixepoch(),unixepoch()),
('ach-6','quiz-mastery','Quiz mastery','Scored at least 80 percent.',100,unixepoch(),unixepoch()),
('ach-7','seven-day-streak','Seven-day streak','Learned for one week.',200,unixepoch(),unixepoch()),
('ach-8','production-ready','Production ready','Completed the final project.',500,unixepoch(),unixepoch());
