import React, {useState} from 'react';
import Layout from '../../../mk/components/layout/Layout';
import TabsButtons from '../../../mk/components/ui/TabsButton/TabsButton';
import List from '../../../mk/components/ui/List/List';
import DataSearch from '../../../mk/components/ui/DataSearch';
import useApi from '../../../mk/hooks/useApi';
import {Linking, TouchableOpacity, View} from 'react-native';
import {getUrlImages} from '../../../mk/utils/strings';
import {ItemList} from '../../../mk/components/ui/ItemList/ItemList';
import Icon from '../../../mk/components/ui/Icon/Icon';

import {
  IconDOC,
  IconEXE,
  IconJPG,
  IconPDF,
  // IconPNG,
  // IconZIP,
} from '../../icons/IconLibrary';
import {cssVar} from '../../../mk/styles/themes';

const Documents = () => {
  // const [tab, setTab] = useState('TO');
  // const [search, setSearch] = useState('');
  const {
    data: documents,
    loaded,
    reload,
  } = useApi(
    '/documents',
    'GET',
    {
      perPage: -1,
      fullType: 'L',
    },
    3,
  );

  // const onSearch = (search: string) => {
  //   setSearch(search);
  // };

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
    if (ext.includes('xlsx')) return 'xlsx';
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
    // if (
    //   search !== '' &&
    //   (document?.name + '').toLowerCase().indexOf(search.toLowerCase()) === -1
    // )
    //   return null;

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
              backgroundColor: cssVar.cWhiteV1,
              padding: 8,
              borderRadius: 100,
            }}>
            <Icon
              size={26}
              name={
                fileType === 'doc'
                  ? IconDOC
                  : fileType === 'xlsx'
                  ? IconEXE
                  : fileType === 'jpg'
                  ? IconJPG
                  : IconPDF
              }
              color={cssVar.cBlack}
            />
          </View>
        }
      />
    );
  };

  return (
    <Layout title="Documentos" refresh={() => reload()}>
      {/* <TabsButtons
        tabs={[
          {value: 'TO', text: 'Todo'},
          {value: 'PD', text: 'Pdf'},
          {value: 'JP', text: 'Imagenes'},
          {value: 'DO', text: 'Doc'},
          {value: 'EX', text: 'Xls'},
        ]}
        sel={tab}
        setSel={setTab}
      /> */}

      {/* <DataSearch
        setSearch={onSearch}
        style={{marginVertical: 12}}
        name="search"
        value={search}
      /> */}
      <List
        style={{marginTop: 12}}
        data={documents?.data}
        renderItem={DocumentList}
        refreshing={!loaded}
      />
    </Layout>
  );
};

export default Documents;
