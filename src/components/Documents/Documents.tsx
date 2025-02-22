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
import {cssVar} from '../../../mk/styles/themes';
import {
  IconDOC,
  IconEXE,
  IconJPG,
  IconPDF,
  IconPNG,
  IconZIP,
} from '../../icons/IconLibrary';

const Documents = () => {
  const [tab, setTab] = useState('TO');
  const [search, setSearch] = useState('');
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

  const DocumentList = (document: any) => {
    if (
      search != '' &&
      (document?.name + '').toLowerCase().indexOf(search.toLowerCase()) == -1
    )
      return null;

    if (
      !(
        tab === 'TO' ||
        (tab === 'PD' && document.ext === 'pdf') ||
        (tab === 'EX' && document.ext === 'exe') ||
        (tab === 'PN' && document.ext === 'png') ||
        (tab === 'DO' && document.ext === 'doc') ||
        (tab === 'ZI' && document.ext === 'zip') ||
        (tab === 'JP' && document.ext === 'jpg')
      )
    )
      return null;
    return (
      <TouchableOpacity onPress={() => openDocument(document)}>
        <ItemList
          title={document?.name}
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
                  document.ext == 'doc'
                    ? IconDOC
                    : document.ext == 'exe'
                    ? IconEXE
                    : document.ext == 'png'
                    ? IconPNG
                    : document.ext == 'zip'
                    ? IconZIP
                    : document.ext == 'jpg'
                    ? IconJPG
                    : IconPDF
                }
                color={cssVar.cWhite}
              />
            </View>
          }
        />
      </TouchableOpacity>
    );
  };
  return (
    <Layout title="Documentos" refresh={() => reload()}>
      <TabsButtons
        tabs={[
          {value: 'TO', text: 'Todo'},
          {value: 'PD', text: 'Pdf'},
          {value: 'JP', text: 'Jpg'},
          {value: 'DO', text: 'Doc'},
          {value: 'EX', text: 'Xls'},
          {value: 'ZI', text: 'Zip'},
          {value: 'PN', text: 'Png'},
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
          data={documents?.data}
          renderItem={DocumentList}
          refreshing={!loaded}
        />
      </View>
    </Layout>
  );
};

export default Documents;
