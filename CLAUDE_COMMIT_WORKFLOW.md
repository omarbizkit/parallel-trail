# Claude Code Commit & Push Workflow

This document outlines the exact steps for committing and pushing changes to ensure consistent execution.

## Pre-Commit Checklist

1. **Check current status**
   ```bash
   git status
   ```

2. **Review changes**
   ```bash
   git diff --staged  # If anything is already staged
   git diff          # For unstaged changes
   ```

3. **Verify current branch**
   ```bash
   git branch --show-current
   ```

## Commit Process

### Method 1: Standard Commit Message (Recommended)
```bash
git add .
git commit -m "Brief description of changes

- Detailed bullet point 1
- Detailed bullet point 2
- Any additional context

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Method 2: HEREDOC for Complex Messages (Alternative)
```bash
git add .
git commit -m "$(cat <<'EOF'
Brief title of changes

- Detailed bullet point 1
- Detailed bullet point 2
- Any additional context

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

## Push Process

### Standard Push (for existing tracking branches)
```bash
git push
```

### First Push (for new branches)
```bash
git push -u origin $(git branch --show-current)
```

### If SSH Fails (Common Issue)
```bash
# Check current remote
 git remote -v
 
# Switch to HTTPS if SSH fails
 git remote set-url origin https://github.com/omarbizkit/parallel-trail.git
 
# Then push
 git push -u origin $(git branch --show-current)
```

## Verification Steps

1. **Confirm commit**
   ```bash
   git log --oneline -1
   ```

2. **Confirm push**
   ```bash
   git status  # Should show "Your branch is up to date"
   ```

3. **Check remote**
   ```bash
   git branch -vv  # Shows tracking relationship
   ```

## Common Issues & Solutions

### Issue: "Permission denied (publickey)"
**Solution**: Switch to HTTPS remote
```bash
git remote set-url origin https://github.com/omarbizkit/parallel-trail.git
```

### Issue: "No such file or directory" for SSH askpass
**Solution**: Use HTTPS instead of SSH (see above)

### Issue: "failed to push some refs"
**Solution**: Pull first, then push
```bash
git pull origin $(git branch --show-current)
git push
```

## Auto-Generated Message Template

For Claude Code commits, always include:
1. Brief descriptive title
2. Bullet points of key changes
3. "🤖 Generated with [Claude Code](https://claude.ai/code)"
4. "Co-Authored-By: Claude <noreply@anthropic.com>"

## Quick Reference Commands

```bash
# Full workflow for new changes
git status
git add .
git commit -m "Your message here
git push

# Full workflow for new branch
git status
git add .
git commit -m "Your message here
git push -u origin $(git branch --show-current)
```

## Repository Information

- **Owner**: omarbizkit
- **Repo**: parallel-trail
- **SSH URL**: git@github.com:omarbizkit/parallel-trail.git
- **HTTPS URL**: https://github.com/omarbizkit/parallel-trail.git
- **Default Branch**: main