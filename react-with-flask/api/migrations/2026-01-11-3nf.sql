-- 3NF hardening for ClassBeyond schema (idempotent where possible)

-- users constraints
ALTER TABLE users
  MODIFY email VARCHAR(255) NOT NULL,
  MODIFY first_name VARCHAR(100) NOT NULL,
  MODIFY last_name VARCHAR(100) NOT NULL,
  MODIFY is_admin TINYINT(1) NOT NULL DEFAULT 0;

-- unique email (skip if already exists)
ALTER TABLE users
  ADD CONSTRAINT uq_users_email UNIQUE (email);

-- user_auth fk cascade
ALTER TABLE user_auth
  ADD CONSTRAINT fk_user_auth_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE;

-- activities naming constraints
ALTER TABLE activities
  MODIFY name VARCHAR(255) NOT NULL;

-- tags uniqueness
ALTER TABLE tags
  MODIFY tag_name VARCHAR(255) NOT NULL,
  ADD CONSTRAINT uq_tags_name UNIQUE (tag_name);

-- competencies uniqueness
ALTER TABLE competencies
  MODIFY competency_name VARCHAR(255) NOT NULL,
  ADD CONSTRAINT uq_competency_name UNIQUE (competency_name);

-- activity_tags junction primary key + cascades
ALTER TABLE activity_tags
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (activity_id, tag_id),
  ADD CONSTRAINT fk_activity_tags_activity FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_activity_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE;

-- activity_competencies junction primary key + cascades
ALTER TABLE activity_competencies
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (activity_id, competency_id),
  ADD CONSTRAINT fk_activity_comp_activity FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_activity_comp_competency FOREIGN KEY (competency_id) REFERENCES competencies(competency_id) ON DELETE CASCADE;

-- user_activities junction primary key + cascades
ALTER TABLE user_activities
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (user_id, activity_id),
  ADD CONSTRAINT fk_user_activities_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_user_activities_activity FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE;
