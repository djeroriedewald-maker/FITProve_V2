-- Table: badges
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    type VARCHAR(50), -- e.g. 'milestone', 'activity', etc.
    category VARCHAR(50),
    criteria TEXT, -- JSON or description of requirements
    is_active BOOLEAN DEFAULT TRUE,
    "order" INTEGER,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP DEFAULT NOW(),
    awarded_by UUID,
    note TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, badge_id)
    -- Optionally: add FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS badge_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    target INTEGER,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
    -- Optionally: add FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS badge_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    event TEXT NOT NULL, -- e.g. 'awarded', 'revoked', 'progressed'
    details TEXT,
    created_at TIMESTAMP DEFAULT NOW()
    -- Optionally: add FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
