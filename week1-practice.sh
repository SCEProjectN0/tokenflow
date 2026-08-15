#!/usr/bin/env bash

# Week 1 practice: create learning directory structure and demonstrate Linux commands.

set -e

BASE_DIR="week1-practice"
rm -rf "$BASE_DIR"
mkdir -p "$BASE_DIR"/{projects,notes,logs,backup}
mkdir -p "$BASE_DIR/projects/{app,docs,data}"
mkdir -p "$BASE_DIR/notes/{personal,study}"

# Create files with touch and here-documents.
touch "$BASE_DIR/projects/app/main.sh"
touch "$BASE_DIR/projects/docs/README.md"
touch "$BASE_DIR/projects/data/sample.csv"

echo "ID,Name,Score" > "$BASE_DIR/projects/data/sample.csv"
echo "1,Alice,85" >> "$BASE_DIR/projects/data/sample.csv"
echo "2,Bob,92" >> "$BASE_DIR/projects/data/sample.csv"

echo "Project app shell script" > "$BASE_DIR/projects/docs/README.md"
echo "#!/usr/bin/env bash" > "$BASE_DIR/projects/app/main.sh"
echo "echo Hello from app" >> "$BASE_DIR/projects/app/main.sh"
chmod +x "$BASE_DIR/projects/app/main.sh"

# Copy and move files to demonstrate cp and mv.
cp "$BASE_DIR/projects/docs/README.md" "$BASE_DIR/notes/study/project-readme.md"
mv "$BASE_DIR/notes/study/project-readme.md" "$BASE_DIR/notes/study/project-intro.md"

# Create log files, including old and temporary files for find/rm.
for i in {1..3}; do
  echo "log entry $i" > "$BASE_DIR/logs/app.log.$i"
done

# Create a temporary file that we will delete later.

echo "temporary data" > "$BASE_DIR/backup/temp.txt"

# Show current directory and list contents.
pwd
ls -la "$BASE_DIR"
ls -la "$BASE_DIR/projects"

# Use cat/less/head/tail on files.
cat "$BASE_DIR/projects/data/sample.csv"
head -n 1 "$BASE_DIR/projects/data/sample.csv"
tail -n 1 "$BASE_DIR/projects/data/sample.csv"

# Find files with a pattern and delete the temporary file.
find "$BASE_DIR" -type f -name "*.txt"
find "$BASE_DIR" -type f -name "temp.txt" -exec rm -v {} \;

# Use chmod to change permissions and explain results.
chmod 640 "$BASE_DIR/projects/data/sample.csv"
ls -l "$BASE_DIR/projects/data/sample.csv"
# Пользователь сможет читать и писать, группа сможет только читать.

# Use chown if available; otherwise comment how to run with sudo.
if command -v chown >/dev/null 2>&1; then
  chown "$USER" "$BASE_DIR/projects/data/sample.csv" || true
  echo "chown выполнен для текущего пользователя (если достаточно прав)."
else
  echo "chown unavailable in this environment."
fi

# Demonstrate sudo usage with a comment: если нужно, выполнить sudo chmod или sudo chown.
echo "Чтобы использовать sudo, выполните: sudo chmod 644 $BASE_DIR/projects/data/sample.csv"

echo "\nWeek 1 practice structure создана в директории: $BASE_DIR"
