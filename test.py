from docx import Document

# Create a new Word Document
doc = Document()

# Generate a large string (>500,000 characters)
text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " * 8000  # ~512,000 chars

# Add the text
doc.add_paragraph(text)

# Save the document
doc.save("large_doc.docx")
