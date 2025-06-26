import fitz
import os

def extraer_texto_desde_pdf(pdf_path):
    """
    Extraer el texto de un archivo PDF utilizando PyMuPDF (fitz)
    """
    try:
        # Abrir el archivo PDF
        pdf_document = fitz.open(pdf_path)
        
        # Variable para almacenar el texto extraído
        text = ""
        
        # Iterar a través de todas las páginas y extraer el texto
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)  # Cargar página
            text += page.get_text("text")  # Extraer texto de la página
        
        # Cerrar el documento
        pdf_document.close()

        return text

    except Exception as e:
        print(f"Error al extraer el texto del PDF: {e}")
        return None

def save_text_to_txt(text, pdf_path):
    """
    Guarda el texto extraído de un archivo PDF en un archivo .txt en la misma carpeta.
    """
    try:
        # Crear la ruta para el archivo .txt con el mismo nombre que el PDF
        txt_filename = os.path.splitext(os.path.basename(pdf_path))[0] + ".txt"
        txt_path = os.path.join(os.path.dirname(pdf_path), txt_filename)
        
        # Guardar el texto en el archivo .txt
        with open(txt_path, 'w', encoding='utf-8') as txt_file:
            txt_file.write(text)
        
        print(f"Texto extraído y guardado en: {txt_path}")
    
    except Exception as e:
        print(f"Error al guardar el texto en el archivo .txt: {e}")


# Ejecutar para probrar, los resultados se visualizan en el archivo CV_ejemplos
def procesar_cvs_en_carpeta(carpeta_path):
    """
    Procesa todos los archivos PDF en la carpeta especificada, extrae el texto y guarda los resultados en archivos .txt.
    """
    try:
        # Listar todos los archivos en la carpeta
        for archivo in os.listdir(carpeta_path):
            # Verificar si el archivo tiene extensión PDF
            if archivo.endswith(".pdf"):
                # Obtener la ruta completa del archivo PDF
                pdf_path = os.path.join(carpeta_path, archivo)
                
                # Extraer texto del PDF
                texto = extraer_texto_desde_pdf(pdf_path)
                
                if texto:  # Si se extrajo texto, guardarlo en un archivo .txt
                    save_text_to_txt(texto, pdf_path)
                else:
                    print(f"No se pudo extraer texto de: {pdf_path}")

    except Exception as e:
        print(f"Error al procesar los archivos en la carpeta: {e}")

# Ejecutar la función para procesar todos los CVs en la carpeta CV_ejemplos
carpeta_cvs = os.path.join(os.path.dirname(__file__), 'CV_ejemplos')  # Ruta relativa a 'CV_ejemplos'
procesar_cvs_en_carpeta(carpeta_cvs)

