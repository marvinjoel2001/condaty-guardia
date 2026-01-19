import React, {useState, useEffect} from 'react';
import ModalFull from '../../../mk/components/ui/ModalFull/ModalFull';
import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import {getUrlImages} from '../../../mk/utils/strings';
import {cssVar, FONTS} from '../../../mk/styles/themes';
import Card from '../../../mk/components/ui/Card/Card';
import useApi from '../../../mk/hooks/useApi';
import Avatar from '../../../mk/components/ui/Avatar/Avatar';
import Br from '../Profile/Br';
import {getDateTimeStrMes} from '../../../mk/utils/dates';
import ImageExpandableModal from '../../../mk/components/ui/ImageExpandableModal/ImageExpandableModal';

type PropsType = {
  open: boolean;
  onClose: () => void;
  id: any;
};

const BinnacleDetail = ({open, onClose, id}: PropsType) => {
  const [details, setDetails] = useState<any>({});
  const [imageError, setImageError] = useState(false);
  const [openExpand, setOpenExpand] = useState<{open: boolean; index: number}>({
    open: false,
    index: 0,
  });

  const {execute, loaded} = useApi();

  const getBinnacleDetail = async () => {
    const {data} = await execute('/guardnews', 'GET', {
      fullType: 'DET',
      searchBy: id,
    });
    if (data?.success) {
      setDetails(data?.data[0]);
    }
  };

  useEffect(() => {
    if (id && open) {
      getBinnacleDetail();
    }
  }, [id, open]);

  const _onClose = () => {
    onClose();
    setDetails({});
    setImageError(false);
    setOpenExpand({open: false, index: 0});
  };

  const renderImageSection = () => {
    const urlFiles = details?.url_file;

    if (!urlFiles || !Array.isArray(urlFiles) || urlFiles.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageText}>Sin imagen</Text>
        </View>
      );
    }

    const screenWidth = Dimensions.get('window').width;
    const imageWidth =
      urlFiles.length > 1 ? screenWidth * 0.7 : screenWidth * 0.85;
    const imageHeight = 220;

    return (
      <>
        <Text style={styles.text}>
          {urlFiles.length === 1
            ? 'Imagen del reporte'
            : 'Imágenes del reporte'}
        </Text>
        <ScrollView
          horizontal={urlFiles.length > 1}
          showsHorizontalScrollIndicator={urlFiles.length > 1}
          contentContainerStyle={
            urlFiles.length > 1 ? styles.imagesScrollContainer : {}
          }>
          {urlFiles.map((url: string, index: number) => (
            <View
              key={index}
              style={[
                styles.imageContainer,
                {width: imageWidth, height: imageHeight},
                urlFiles.length > 1 &&
                  index < urlFiles.length - 1 &&
                  styles.imageMarginRight,
              ]}>
              <Avatar
                hasImage={1}
                expandable={false}
                src={url}
                name={`Imagen ${index + 1}`}
                w={imageWidth}
                h={imageHeight}
                circle={false}
                error={() => {}}
                style={styles.avatarImage}
                onClick={() => setOpenExpand({open: true, index})}
              />
            </View>
          ))}
        </ScrollView>
      </>
    );
  };

  const renderContent = () => {
    if (!loaded) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={{color: cssVar.cWhite}}>Cargando...</Text>
        </View>
      );
    }

    return (
      <Card>
        <Text style={styles.text}>Reporte</Text>
        <Text style={{...styles.textV1}}>
          {getDateTimeStrMes(details?.created_at)}
        </Text>
        <Text style={{...styles.textV1}}>{details?.descrip}</Text>
        <Br />
        {renderImageSection()}
      </Card>
    );
  };

  return (
    <ModalFull
      open={open}
      title="Detalle de bitácora"
      onClose={_onClose}
      buttonCancel=""
      buttonText="">
      {renderContent()}
      {openExpand.open &&
        Array.isArray(details?.url_file) &&
        details?.url_file?.length > 0 && (
          <ImageExpandableModal
            visible={openExpand.open}
            images={details?.url_file}
            initialIndex={openExpand.index}
            onClose={() => setOpenExpand({open: false, index: 0})}
          />
        )}
    </ModalFull>
  );
};

export default BinnacleDetail;

const styles = StyleSheet.create({
  text: {
    color: cssVar.cWhite,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  textV1: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    marginTop: 12,
  },
  imageContainer: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: cssVar.cWhiteV2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageMarginRight: {
    marginRight: 12,
  },
  imagesScrollContainer: {
    paddingRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    padding: 20,
    backgroundColor: cssVar.cBlackV2,
    borderRadius: 8,
  },
  noImageText: {
    color: cssVar.cWhiteV1,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
  },
});
