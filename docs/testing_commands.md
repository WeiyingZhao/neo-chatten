# Testing Commands

Run these commands from the repository root. They assume dependencies are installed via `uv sync` or `pip install -e .[dev]`.

```bash
# Run the full test suite
uv run pytest

# Run tests with coverage reporting (terminal summary)
uv run pytest --cov=. --cov-report=term-missing

# Generate an HTML coverage report in `htmlcov/`
uv run pytest --cov=. --cov-report=html

# Execute a specific test file or node
uv run pytest tests/test_example.py -k "scenario_name"

# Drop into a debugger on failure for interactive troubleshooting
uv run pytest -x --pdb
```
