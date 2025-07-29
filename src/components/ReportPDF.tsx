// Arquivo: src/components/ReportPDF.tsx

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Define os tipos de dados que o PDF receberá
interface GlucoseRecord {
  glucose_level: number;
  insulin_units: number | null;
  hba1c: number | null;
  note: string | null;
  created_at: string;
}

interface ReportPDFProps {
  patientName: string;
  startDate: string;
  endDate: string;
  records: GlucoseRecord[];
}

// Criação dos estilos para o PDF (similar a CSS)
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Helvetica-Bold',
  },
  header: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    color: 'grey',
  },
  sectionTitle: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
  },
  recordContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
    marginBottom: 5,
  },
  recordText: {
    fontSize: 11,
  },
  recordDate: {
    fontFamily: 'Helvetica-Bold',
  },
});

// Este é o componente que define a estrutura do seu PDF
export const ReportPDF = ({ patientName, startDate, endDate, records }: ReportPDFProps) => {
  // Cálculos para o resumo
  const totalApplications = records.length;
  const totalInsulin = records.reduce((sum, record) => sum + (record.insulin_units || 0), 0);
  const averageInsulin = totalApplications > 0 ? (totalInsulin / totalApplications).toFixed(1) : '0';

  const formatDate = (dateString: string) => {
    // Adiciona o fuso horário UTC para evitar problemas
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Relatório de Insulina</Text>
        <Text style={styles.header}>Paciente: {patientName}</Text>
        <Text style={styles.header}>Período: {formatDate(startDate)} a {formatDate(endDate)}</Text>

        <Text style={styles.sectionTitle}>Resumo</Text>
        <Text>- Total de aplicações: {totalApplications}</Text>
        <Text>- Total de insulina: {totalInsulin.toFixed(1)} unidades</Text>
        <Text>- Média por aplicação: {averageInsulin} unidades</Text>

        <Text style={styles.sectionTitle}>Detalhes das Aplicações</Text>
        {records.map((record, index) => {
          const date = new Date(record.created_at);
          return (
            <View key={index} style={styles.recordContainer}>
              <Text style={styles.recordDate}>
                {index + 1}. {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.recordText}>   - Glicose: {record.glucose_level} mg/dL</Text>
              <Text style={styles.recordText}>   - Insulina: {record.insulin_units} unidades</Text>
              {record.note && <Text style={styles.recordText}>   - Observação: "{record.note}"</Text>}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};