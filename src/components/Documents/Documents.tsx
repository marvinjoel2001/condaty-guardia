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
import DocumentDetail from './DocumentDetail';

const Documents = () => {
  const [openDeatil, setOpenDetail] = useState({open: false, item: null});
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
    const fileType = getFileType(document.ext.toLowerCase());

    return (
      <ItemList
        title={document?.name}
        onPress={() => setOpenDetail({open: true, item: document})}
        subtitle="Administración"
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
      <List
        style={{marginTop: 12}}
        data={documents?.data}
        renderItem={DocumentList}
        refreshing={!loaded}
      />

      {openDeatil?.open && (
        <DocumentDetail
          open={openDeatil?.open}
          onClose={() => setOpenDetail({open: false, item: null})}
          item={openDeatil?.item}
        />
      )}
    </Layout>
  );
};

export default Documents;
