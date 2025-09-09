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

## 🛡️ Branch Protection Rules (Applied)

The main branch is protected with the following security settings:

### Required Status Checks
- ✅ **validate** check must pass (includes linting, type-checking, formatting)
- ✅ **Strict mode**: Branch must be up-to-date before merging

### Required Pull Request Reviews
- ✅ **1 approving review** required before merge
- ✅ **Stale review dismissal** when new commits are pushed
- ✅ **No code owner requirement** (flexible for development)

### Security Protections
- ✅ **Force pushes BLOCKED** (prevents history rewriting)
- ✅ **Branch deletion BLOCKED** (prevents accidental loss)
- ✅ **Conversation resolution required** (ensures discussions settled)

### Admin Flexibility
- ✅ **Admins can bypass** (emergency access if needed)
- ✅ **Fork syncing allowed** (for collaboration)

## 🔄 Updated Development Workflow

### For Feature Development:
1. **Create feature branch**: `git checkout -b feature-name`
2. **Develop and test** your changes
3. **Commit with validation**: `npm run validate` must pass
4. **Push to remote**: `git push -u origin feature-name`
5. **Create Pull Request** through GitHub web interface
6. **Get approval** from reviewer (can be yourself for solo development)
7. **Merge** after all checks pass

### For Task-Based Development (Current Method):
1. **Create task branch**: `git checkout -b 00X-task-name`
2. **Complete task** with proper testing
3. **Validate code**: `npm run validate` (automatic on commit)
4. **Commit and push**: Follow standard workflow above
5. **Create PR** for review and merge

### Emergency Procedures:
If you need to bypass protection (emergency fixes):
- Admins can override protection rules
- Use GitHub web interface "Bypass branch protection" option
- Document the emergency in commit message

## ⚠️ Important Notes with Branch Protection

### What Changed:
- **Direct pushes to main are blocked** - must use PRs
- **Status checks must pass** - validation is enforced
- **Review required** - even if reviewing your own PRs
- **Branch cannot be deleted** - permanent protection

### What Remains the Same:
- **Feature branch workflow** continues normally
- **Commit process** unchanged (still validates automatically)
- **Development speed** - protection adds minimal overhead
- **Emergency access** - admins can bypass if needed

### Best Practices with Protection:
1. **Keep feature branches small** and focused
2. **Write clear PR descriptions** for context
3. **Review your own PRs** before merging (self-review)
4. **Ensure status checks pass** before requesting review
5. **Use meaningful commit messages** for history clarity

## 🚀 Quick Workflow with Protection

```bash
# New feature development
git checkout -b feature/new-feature
# ... develop and test ...
git add .
git commit -m "feat: Add new feature

- Implementation details
- Testing completed

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push -u origin feature/new-feature
# Create PR via GitHub web interface
# Approve and merge after checks pass
```

This protection setup provides **enterprise-grade security** while maintaining **developer-friendly workflow** for your project!