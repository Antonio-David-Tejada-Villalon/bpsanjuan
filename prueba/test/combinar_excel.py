import pandas as pd

def combinar_planillas(file1, file2, output_file):
    """
    Combina dos archivos Excel verificando que el título de la hoja sea el mismo.
    Crea un archivo Excel con todas las columnas combinadas y sin duplicados,
    siguiendo un orden específico de columnas. Los datos se combinan usando 'title' como clave.

    :param file1: Ruta al primer archivo Excel.
    :param file2: Ruta al segundo archivo Excel.
    :param output_file: Ruta donde se guardará el archivo combinado.
    """
    try:
        # Leer los archivos Excel
        excel1 = pd.ExcelFile(file1)
        excel2 = pd.ExcelFile(file2)

        # Función para obtener hojas visibles
        def get_visible_sheets(excel_file):
            workbook = excel_file.book  # Acceder al libro de trabajo interno
            visible_sheets = [sheet for sheet in workbook.sheetnames if workbook[sheet].sheet_state == 'visible']
            return visible_sheets

        # Obtener hojas visibles de ambos archivos
        sheets1 = get_visible_sheets(excel1)
        sheets2 = get_visible_sheets(excel2)

        print(f"Hojas visibles en {file1}: {sheets1}")
        print(f"Hojas visibles en {file2}: {sheets2}")

        # Verificar que ambos archivos tengan al menos una hoja visible con el mismo nombre
        common_sheets = set(sheets1).intersection(sheets2)
        if not common_sheets:
            raise ValueError("No hay hojas visibles con nombres coincidentes en ambos archivos.")

        # Orden deseado de las columnas
        column_order = ["title", "author", "editorial", "price", "image", "isbn", "dimensions", "pages", "code", "stock"]

        # Procesar cada hoja común
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            for sheet in common_sheets:
                try:
                    # Leer las hojas correspondientes
                    df1 = excel1.parse(sheet)
                    df2 = excel2.parse(sheet)

                    # Comprobar si los DataFrames están vacíos
                    if df1.empty and df2.empty:
                        print(f"La hoja '{sheet}' está vacía en ambos archivos. Se omite.")
                        continue

                    # Asegurarse de que ambas hojas tengan al menos la columna 'title'
                    if "title" not in df1.columns or "title" not in df2.columns:
                        print(f"La hoja '{sheet}' no tiene la columna 'title'. Se omite.")
                        continue

                    # Agregar columnas faltantes con valores vacíos
                    for col in column_order:
                        if col not in df1.columns:
                            df1[col] = ""
                        if col not in df2.columns:
                            df2[col] = ""

                    # Combinar los DataFrames usando 'title' como clave
                    combined_df = pd.concat([df1, df2], ignore_index=True)

                    # Eliminar duplicados basados en 'title', manteniendo los valores no nulos
                    combined_df = combined_df.groupby("title", as_index=False).agg(lambda x: x.dropna().values[0] if not x.dropna().empty else "")

                    # Reorganizar las columnas según el orden deseado
                    combined_df = combined_df[column_order]

                    # Guardar la hoja combinada en el archivo de salida
                    combined_df.to_excel(writer, sheet_name=sheet, index=False)

                except Exception as e:
                    print(f"Error al procesar la hoja '{sheet}': {e}")

        print(f"Archivo combinado guardado exitosamente en: {output_file}")

    except Exception as e:
        print(f"Error general: {e}")

# Ejemplo de uso
if __name__ == "__main__":
    file1 = "archivo1.xlsx"  # Ruta al primer archivo Excel
    file2 = "archivo2.xlsx"  # Ruta al segundo archivo Excel
    output_file = "archivo_combinado.xlsx"  # Ruta al archivo de salida

    combinar_planillas(file1, file2, output_file)