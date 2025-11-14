import 'dart:io';
import 'package:path_provider/path_provider.dart';

class CsvUtils {
  static Future<void> saveCsv({
    required List<String> headers,
    required List<List<dynamic>> rows,
    required String filename,
  }) async {
    final directory = await getApplicationDocumentsDirectory();
    final filePath = '${directory.path}/$filename';
    final file = File(filePath);

    final buffer = StringBuffer();
    buffer.writeln(headers.join(','));

    for (final row in rows) {
      buffer.writeln(row.join(','));
    }

    await file.writeAsString(buffer.toString(), flush: true);
  }
}
