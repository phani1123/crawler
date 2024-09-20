#!/bin/bash

# Directory to clone the repositories into
TARGET_DIR="new_folder"

# Paths to the Git repositories
REPO1="https://github.com/celigo/integrator-ui.git"
REPO2="https://github.com/celigo/fuse-ui.git"

# Create the target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Function to clone or pull the latest changes from a repository
pull_repo() {
  local repo_url=$1
  local repo_name=$(basename "$repo_url" .git)
  local repo_path="$TARGET_DIR/$repo_name"
  
  if [ -d "$repo_path/.git" ]; then
    echo "Pulling latest changes in $repo_path"
    cd "$repo_path" || exit
    git pull
    cd - || exit
  else
    echo "Cloning repository $repo_url into $repo_path"
    git clone "$repo_url" "$repo_path"
  fi
}

# Pull the latest changes from both repositories
pull_repo "$REPO1"
pull_repo "$REPO2"