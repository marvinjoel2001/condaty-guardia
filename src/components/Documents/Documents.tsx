import React, {useEffect, useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import List from '../../../mk/components/ui/List/List';
import DataSearch from '../../../mk/components/ui/DataSearch';
import useApi from '../../../mk/hooks/useApi';
import {Linking, View} from 'react-native';
import {getUrlImages} from '../../../mk/utils/strings';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import Icon from '../../../mk/components/ui/Icon/Icon';
import {IconDOC, IconEXE, IconJPG, IconPDF} from '../../icons/IconLibrary';
import {cssVar} from '../../../mk/styles/themes';

const Documents = () => {
  const [tab, setTab] = useState('TO');
  const [search, setSearch] = useState('');
  const [dataFilter, setDataFilter] = useState([]);
  const {
    data: documents,
    loaded,
    reload,
  } = useApi('/documents', 'GET', {
    perPage: -1,
    fullType: 'L',
  });

  const onSearch = (search: string) => {
    setSearch(search);
  };

  const openDocument = (document: any) => {
    const documentUrl = getUrlImages(
      '/DOC-' +
        document?.id +
        '.' +
        document.ext +
        '?d=' +
        document?.updated_at,
    );
    Linking.openURL(documentUrl).catch(err => {
      console.error('Error al abrir el enlace: ', err);
    });
  };

  const getFileType = (ext: string) => {
    // Normalizar las extensiones para manejar variaciones como 'docx', 'xlsx', etc.
    if (ext.includes('pdf')) return 'pdf';
    if (ext.includes('doc')) return 'doc';
    if (ext.includes('xls')) return 'xls';
    if (
      ext.includes('jpg') ||
      ext.includes('jpeg') ||
      ext.includes('webp') ||
      ext.includes('png')
    )
      return 'jpg';
    if (ext.includes('exe')) return 'exe';
    return ext;
  };

  const DocumentList = (document: any) => {
    // Filtrar por búsqueda
    if (
      search !== '' &&
      (document?.name + '').toLowerCase().indexOf(search.toLowerCase()) === -1
    )
      return null;

    // Obtener el tipo de archivo normalizado
    const fileType = getFileType(document.ext.toLowerCase());

    // if (
    //   !(
    //     tab === 'TO' || // Todo
    //     (tab === 'PD' && fileType === 'pdf') ||
    //     (tab === 'EX' && fileType === 'xls') ||
    //     (tab === 'DO' && fileType === 'doc') ||
    //     (tab === 'JP' && fileType === 'jpg')
    //   )
    // )
    //   return null;

    return (
      <ItemList
        title={document?.name}
        onPress={() => openDocument(document)}
        subtitle="Administración"
        //date={document.created_at}
        left={
          <View
            style={{
              backgroundColor: cssVar.cBlackV1,
              padding: 8,
              borderRadius: 100,
            }}>
            <Icon
              style={{
                justifyContent: 'center',
                marginLeft: 7,
                marginTop: 6,
              }}
              size={26}
              name={
                fileType === 'doc'
                  ? IconDOC
                  : fileType === 'exe'
                  ? IconEXE
                  : fileType === 'jpg'
                  ? IconJPG
                  : IconPDF
              }
              color={cssVar.cWhite}
            />
          </View>
        }
      />
    );
  };

  useEffect(() => {
    if (tab === 'TO') {
      setDataFilter(documents?.data);
    }
    if (tab === 'PD') {
      setDataFilter(
        documents?.data.filter((document: any) => document.ext === 'pdf'),
      );
    }
    if (tab === 'DO') {
      setDataFilter(
        documents?.data.filter(
          (document: any) => document.ext === 'doc' || document.ext === 'docx',
        ),
      );
    }
    if (tab === 'EX') {
      setDataFilter(
        documents?.data.filter(
          (document: any) => document.ext === 'xls' || document.ext === 'xlsx',
        ),
      );
    }
    if (tab === 'JP') {
      setDataFilter(
        documents?.data.filter(
          (document: any) =>
            document.ext === 'jpg' ||
            document.ext === 'jpeg' ||
            document.ext === 'webp' ||
            document.ext === 'png',
        ),
      );
    }
  }, [tab, documents?.data]);

  return (
    <Layout title="Documentos" refresh={() => reload()}>
      <TabsButtons
        tabs={[
          {value: 'TO', text: 'Todo'},
          {value: 'PD', text: 'Pdf'},
          {value: 'JP', text: 'Imagenes'},
          {value: 'DO', text: 'Doc'},
          {value: 'EX', text: 'Xls'},
        ]}
        sel={tab}
        setSel={setTab}
      />
      <View style={{paddingHorizontal: 16}}>
        <DataSearch
          setSearch={onSearch}
          style={{marginVertical: 4}}
          name="search"
          value={search}
        />
        <List
          data={dataFilter}
          renderItem={DocumentList}
          refreshing={!loaded}
        />
      </View>
    </Layout>
  );
};

export default Documents;
