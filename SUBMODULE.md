# Adding Server as Git Submodule

To use the `server/` directory as a git submodule:

1. **Create a new remote repository** for the server (e.g. `cms-api-server`).

2. **Initialize and push the server:**

   ```bash
   cd server
   git init
   git add .
   git commit -m "Initial: Node.js + MongoDB CMS API"
   git branch -M main
   git remote add origin https://github.com/YOUR_USER/cms-api-server.git
   git push -u origin main
   cd ..
   ```

3. **Remove server from the main repo and add as submodule:**

   ```bash
   rm -rf server
   git submodule add https://github.com/YOUR_USER/cms-api-server.git server
   ```

4. **Clone the project with submodules:**
   ```bash
   git clone --recurse-submodules <main-repo-url>
   # or after clone:
   git submodule update --init --recursive
   ```
