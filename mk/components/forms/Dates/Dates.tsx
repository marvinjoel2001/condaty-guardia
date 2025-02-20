import React, {CSSProperties, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import Select from '../Select/Select';
import {cssVar} from '../../../styles/themes';

type PropsType = {
  onChange: (day: number, month: number, year: number) => void;
  style?: CSSProperties | any;
  isNacimiento?: boolean;
  value?: string | any;
};

const Dates = ({
  onChange,
  style = {},
  value,
  isNacimiento = false,
}: PropsType) => {
  const currentYear = isNacimiento
    ? new Date().getFullYear() - 15
    : new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDay = new Date().getDate();

  const [selectedYear, setSelectedYear]: any = useState(null);
  const [selectedMonth, setSelectedMonth]: any = useState(null);
  const [selectedDay, setSelectedDay]: any = useState(null);

  useEffect(() => {
    if (value) {
      const valueSplit = value.split('-');
      setSelectedYear(Number(valueSplit[0]));
      setSelectedMonth(Number(valueSplit[1]));
      setSelectedDay(Number(valueSplit[2]));
    } else if (isNacimiento) {
      // const defaultYear = 1980;
      // const defaultMonth = 1; // Enero
      // const defaultDay = 1;
      const defaultYear = '';
      const defaultMonth = '';
      const defaultDay = '';
      setSelectedYear(defaultYear);
      setSelectedMonth(defaultMonth);
      setSelectedDay(defaultDay);
    } else {
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
      setSelectedDay(currentDay);
    }
  }, [value, isNacimiento]);

  const generateYearOptions = (startYear: number, endYear: number) => {
    let years = [];
    for (let year = startYear; year <= endYear; year++) {
      years.push({id: year, name: year.toString()});
    }
    return (years = years.sort((a, b) => b.id - a.id));
  };

  const generateMonthOptions = () => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months.map((month, index) => ({id: index + 1, name: month}));
  };

  const generateDayOptions = (year: number | null, month: number | null) => {
    if (!year || !month) {
      return [];
    }
    const daysInMonth = new Date(year, month, 0).getDate();
    let days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({id: day, name: day.toString()});
    }
    return days;
  };

  const yearOptions = generateYearOptions(1900, currentYear);
  const monthOptions = generateMonthOptions();
  const dayOptions = generateDayOptions(selectedYear, selectedMonth);

  useEffect(() => {
    if (selectedYear && selectedMonth) {
      const days = generateDayOptions(selectedYear, selectedMonth);
      if (!days.find(day => day.id === selectedDay)) {
        setSelectedDay(null);
      }
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    if (
      selectedDay !== null &&
      selectedMonth !== null &&
      selectedYear !== null &&
      onChange
    ) {
      onChange(selectedDay, selectedMonth, selectedYear);
    }
  }, [selectedDay, selectedMonth, selectedYear]);
  return (
    <View style={{...styles.container, ...style}}>
      <Select
        options={yearOptions}
        value={selectedYear}
        name="year"
        optionLabel="name"
        optionValue="id"
        onChange={e => setSelectedYear(Number(e.target.value))}
        label="Año"
        // placeholder="Año"
        isWidth={30}
        filter
      />
      <Select
        options={monthOptions}
        value={selectedMonth}
        name="month"
        optionLabel="name"
        optionValue="id"
        onChange={e => setSelectedMonth(Number(e.target.value))}
        label="Mes"
        // placeholder="Mes"
        isWidth={30}
        filter
      />
      <Select
        options={dayOptions}
        value={selectedDay}
        name="day"
        optionLabel="name"
        optionValue="id"
        onChange={e => setSelectedDay(Number(e.target.value))}
        label="Día"
        // placeholder="Día"
        isWidth={30}
        filter
      />
    </View>
  );
};

export default Dates;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: cssVar.spS,
    zIndex: 1,
  },
});
