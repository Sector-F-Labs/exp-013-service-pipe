# Makefile for exp-013-service-pipe

.PHONY: pdf html clean help check-deps install-deps build check-deno

# Default target
all: pdf
# Binary output directory
BIN_DIR := bin


# Convert README.md to PDF using pandoc with date-stamped filename
pdf:
	@$(eval PDF_NAME := exp-013-service-pipe-$(shell date +%Y-%m-%d).pdf)
	@echo "Generating $(PDF_NAME)..."
	@pandoc README.md -o $(PDF_NAME) --toc --number-sections || \
	pandoc README.md -o $(PDF_NAME) --pdf-engine=wkhtmltopdf --toc --number-sections || \
	pandoc README.md -o $(PDF_NAME) --pdf-engine=weasyprint --toc --number-sections || \
	pandoc README.md -o $(PDF_NAME) --pdf-engine=prince --toc --number-sections || \
	pandoc README.md -o $(PDF_NAME) --pdf-engine=context --toc --number-sections || \
	(echo "No PDF engine available. Installing weasyprint..." && $(MAKE) install-weasyprint && pandoc README.md -o $(PDF_NAME) --pdf-engine=weasyprint --toc --number-sections)
	@echo "PDF generated: $(PDF_NAME)"

# Convert README.md to HTML
html: README.html

README.html: README.md
	pandoc README.md -o README.html --standalone --toc

# Install weasyprint using pipx
install-weasyprint:
	@echo "Installing weasyprint via pipx..."
	@which pipx > /dev/null || brew install pipx
	pipx install weasyprint

# Install dependencies
install-deps:
	@echo "Installing dependencies..."
	brew install pandoc
	$(MAKE) install-weasyprint
	@echo "Dependencies installed!"
# Check if deno is installed
check-deno:
	@command -v deno > /dev/null || { echo "Error: deno not found. Please install Deno."; exit 1; }

# Build Deno executables
build: check-deno $(BIN_DIR)/telegram-in $(BIN_DIR)/telegram-out $(BIN_DIR)/responder

$(BIN_DIR):
	mkdir -p $(BIN_DIR)

$(BIN_DIR)/telegram-in: telegram-in/main.ts | $(BIN_DIR)
	deno compile -o $(BIN_DIR)/telegram-in telegram-in/main.ts

$(BIN_DIR)/telegram-out: telegram-out/main.ts | $(BIN_DIR)
	deno compile -o $(BIN_DIR)/telegram-out telegram-out/main.ts

$(BIN_DIR)/responder: telegram-responder/main.ts | $(BIN_DIR)
	deno compile -o $(BIN_DIR)/responder telegram-responder/main.ts


# Clean generated files
clean:
	rm -f exp-013-service-pipe-*.pdf README.html

# Check if required tools are installed
check-deps:
	@echo "Checking dependencies..."
	@which pandoc > /dev/null || (echo "Error: pandoc not found. Run 'make install-deps'" && exit 1)
	@echo "pandoc: ✓"
	@pipx list | grep -q weasyprint && echo "weasyprint: ✓" || echo "weasyprint: Run 'make install-deps'"

# Help target
help:
	@echo "Available targets:"
	@echo "  pdf          - Convert README.md to PDF (default)"
	@echo "  html         - Convert README.md to HTML"
	@echo "  install-deps - Install pandoc and weasyprint"
	@echo "  clean        - Remove generated files"
	@echo "  check-deps   - Check if dependencies are installed"
	@echo "  build        - Compile Deno services"
	@echo "  help         - Show this help message"
	@echo ""
	@echo "Dependencies:"
	@echo "  pandoc: Document converter"
	@echo "  weasyprint: PDF engine (installed via pipx)"
