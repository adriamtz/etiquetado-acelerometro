import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:etiqueta_acelerometro/providers/tagged_data_provider.dart';
import 'package:etiqueta_acelerometro/pages/tagged_data_page.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => TaggedDataProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Etiquetado acelerómetro',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const TaggedDataPage(),
    );
  }
}
