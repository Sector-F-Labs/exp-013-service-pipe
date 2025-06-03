# Makefile for exp-013-service-pipe

.PHONY: pdf html clean help check-deps

# Default target
all: html

# Convert README.md to HTML
html: README.html

README.html: README.md
	pandoc README.md -o README.html --standalone --toc

# Generate PDF instruction
pdf:
	@echo "To create PDF:"
	@echo "1. Run: make html"
	@echo "2. Open README.html in your browser"
	@echo "3. Print to PDF (Cmd+P, then 'Save as PDF')"
	@$(MAKE) html

# Clean generated files
clean:
	rm -f README.html

# Check if pandoc is installed
check-deps:
	@which pandoc > /dev/null || (echo "Error: pandoc not found. Install with: brew install pandoc" && exit 1)
	@echo "pandoc: ✓"

# Help target
help:
	@echo "Available targets:"
	@echo "  html       - Convert README.md to HTML (default)"
	@echo "  pdf        - Instructions for creating PDF from HTML"
	@echo "  clean      - Remove generated HTML file"
	@echo "  check-deps - Check if pandoc is installed"
	@echo "  help       - Show this help message"
	@echo ""
	@echo "Dependencies:"
	@echo "  pandoc: brew install pandoc"