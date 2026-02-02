import classes from "./theme-gifts.module.css";
import Image from "next/image";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  Flex,
  Group,
  Stack,
  UnstyledButton,
  Input,
  NumberInput,
  Switch,
  Select,
  Collapse,
} from "@mantine/core";
import { HeartRating } from "../common/heart-rating/heartrating";
import { AddFileButton } from "../common/add-file-button/add-file-button";
import { Gift_t, GiftCollection_t } from "@/types/app/theme";
import { GiftData, GiftCollectionData } from "@/types/api/theme";

interface GiftCollectionHandle {
  getData: () => GiftCollection_t;
}

interface GiftHandle {
  getData: () => Gift_t;
}

interface ThemeGiftsProps {
  initialData: GiftCollectionData[];
  disabled?: boolean;
}

export const ThemeGifts = forwardRef(
  ({ initialData, disabled }: ThemeGiftsProps, ref) => {
    const [opened, { toggle }] = useDisclosure(false);

    const [collections, setCollections] = useState<
      { id: string; data?: GiftCollectionData }[]
    >([]);

    const collectionRefs = useRef<{
      [key: string]: GiftCollectionHandle | null;
    }>({});

    useEffect(() => {
      if (!initialData || initialData.length <= 0) {
        setCollections([]);
        return;
      }

      setCollections(
        initialData.map((data) => ({
          id: crypto.randomUUID(),
          data: data,
        })),
      );
      if (!opened) toggle();
    }, [initialData]);

    const addCollection = () => {
      setCollections((prev) => [
        ...prev,
        { id: crypto.randomUUID(), data: undefined },
      ]);
      if (!opened) toggle();
    };

    useImperativeHandle(ref, () => ({
      getAllData: () =>
        collections
          .map((col) => collectionRefs.current[col.id]?.getData())
          .filter((data): data is GiftCollection_t => data !== undefined),
    }));

    return (
      <div style={{ position: "relative" }}>
        {/* 선물 세팅 추가 버튼 */}
        {!disabled && (
          <UnstyledButton
            className={classes.AddGiftSettingButton}
            w={28}
            h={28}
            onClick={addCollection}
          >
            <Image
              src="/images/theme-setting/add-gift.svg"
              alt=""
              width={28}
              height={28}
            />
          </UnstyledButton>
        )}

        <UnstyledButton className={classes.Button} onClick={toggle}>
          <p>선물 목록 관리</p>
        </UnstyledButton>

        <Collapse pb={`${collections.length == 0 ? 0 : 12}`} in={opened}>
          <Stack gap={10}>
            {collections.map((col) => (
              <GiftCollection
                key={col.id}
                initialData={col.data}
                disabled={disabled}
                onDelete={() => {
                  delete collectionRefs.current[col.id];
                  setCollections((prev) =>
                    prev.filter((item) => item.id !== col.id),
                  );
                }}
                ref={(el) => {
                  collectionRefs.current[col.id] = el as GiftCollectionHandle;
                }}
              />
            ))}
          </Stack>
        </Collapse>
      </div>
    );
  },
);

interface GiftCollectionProps {
  initialData?: GiftCollectionData;
  disabled?: boolean;
  onDelete: () => void;
}

export const GiftCollection = forwardRef(
  ({ initialData, disabled, onDelete }: GiftCollectionProps, ref) => {
    const [heartRate, setHeartRate] = useState<string | number>(0);
    const [itemTotalNumber, setItemTotalNumber] = useState<string | number>(0);

    const [isRandom, setIsRandom] = useState(false);
    const [isSameTheme, setSameTheme] = useState(false);

    const [themeType, setThemeType] = useState<string | null>("NORMAL");
    const [rarity, setRarity] = useState<string | null>("SR");

    const [gifts, setGifts] = useState<{ id: string; data?: GiftData }[]>([]);
    const giftRefs = useRef<{ [key: string]: GiftHandle | null }>({});

    useEffect(() => {
      if (!initialData) {
        setHeartRate(0);
        setItemTotalNumber(0);

        setIsRandom(false);
        setSameTheme(false);

        setThemeType("NORMAL");
        setRarity("SR");

        setGifts([]);
        return;
      }

      setHeartRate(initialData.heart_rate);
      setItemTotalNumber(initialData.gift_total_num);

      setIsRandom(initialData.is_random);
      setSameTheme(initialData.is_same_theme ?? false);

      setThemeType(initialData.theme_type ?? "NORMAL");
      setRarity(initialData.rarity ?? "SR");

      setGifts(
        initialData.gifts.map((gift) => ({
          id: crypto.randomUUID(),
          data: gift,
        })),
      );
    }, [initialData]);

    const addGift = () =>
      setGifts((prev) => [
        ...prev,
        { id: crypto.randomUUID(), data: undefined },
      ]);

    const moveGift = (id: string, direction: "up" | "down") => {
      setGifts((prev) => {
        const currentIndex = prev.findIndex((item) => item.id === id);
        const targetIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1;

        // Out-of-range
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;

        const newIds = [...prev];
        // Swap (using Array Destructuring)
        [newIds[currentIndex], newIds[targetIndex]] = [
          newIds[targetIndex],
          newIds[currentIndex],
        ];

        return newIds;
      });
    };

    useImperativeHandle(ref, () => ({
      getData: () => ({
        heart_rate: typeof heartRate === "number" ? heartRate : 0,
        gift_total_num:
          typeof itemTotalNumber === "number" ? itemTotalNumber : 0,
        is_random: isRandom,
        is_same_theme: isRandom ? isSameTheme : null,
        theme_type: isRandom ? themeType : null,
        rarity: isRandom ? rarity : null,
        gifts: gifts
          .map((gift) => giftRefs.current[gift.id]?.getData())
          .filter((data): data is Gift_t => data !== undefined),
      }),
    }));

    return (
      <div className={classes.GiftSettingWrapper}>
        {/* 선물 세팅 삭제 버튼 */}
        {!disabled && (
          <UnstyledButton
            className={classes.DeleteGiftSettingButton}
            w={28}
            h={28}
            onClick={onDelete}
          >
            <Image
              src="/images/theme-setting/delete-gift.svg"
              alt=""
              width={28}
              height={28}
            />
          </UnstyledButton>
        )}

        <Stack gap={12}>
          {/* 하트 레이팅 / 총 아이템 개수 */}
          <Group justify="space-between" pr={40}>
            {/* 하트 레이팅 / 하트 레이트 입력 */}
            <Group gap={8}>
              <HeartRating
                value={typeof heartRate === "number" ? heartRate : 0}
                unitW={25}
                unitH={22}
              />
              <NumberInput
                classNames={{ input: classes.NumberInput }}
                value={heartRate}
                onChange={setHeartRate}
                defaultValue={0.0}
                max={5}
                min={0}
                decimalScale={2}
                fixedDecimalScale
                hideControls
                disabled={disabled}
              />
            </Group>

            {/* 총 아이템 개수 */}
            <Group align="center" gap={8}>
              <NumberInput
                classNames={{ input: classes.NumberInput }}
                value={itemTotalNumber}
                onChange={setItemTotalNumber}
                defaultValue={0}
                min={0}
                decimalScale={0}
                fixedDecimalScale
                hideControls
                disabled={disabled}
              />
              <p>개</p>
            </Group>
          </Group>

          {/* 선물 */}
          {gifts.map((gift, index) => (
            <Gift
              key={gift.id}
              initialData={gift.data}
              isTop={index === 0}
              isBottom={index === gifts.length - 1}
              moveUp={() => moveGift(gift.id, "up")}
              moveDown={() => moveGift(gift.id, "down")}
              disabled={disabled}
              onDelete={() => {
                delete giftRefs.current[gift.id];
                setGifts((prev) => prev.filter((item) => item.id !== gift.id));
              }}
              ref={(el) => {
                giftRefs.current[gift.id] = el as GiftHandle;
              }}
            />
          ))}

          {/* 선물 추가 버튼 / 선물 세팅들 */}
          <Group justify="flex-start" gap={8} mih={80} wrap="nowrap">
            {/* 선물 추가 버튼 */}
            <Flex align="center" justify="center" w={125} miw={125}>
              {!disabled && (
                <UnstyledButton w={20} h={20} onClick={addGift}>
                  <Image
                    src="/images/theme-setting/add-gift.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                </UnstyledButton>
              )}
            </Flex>

            {/* 선물 세팅들 */}
            <Stack gap={8}>
              {/* 랜덤 아이템 여부 */}
              <Switch
                classNames={{
                  body: classes.SwitchBody,
                }}
                styles={{
                  track: {
                    backgroundColor: `${
                      isRandom ? "var(--blue)" : "var(--gray-f2)"
                    }`,
                  },
                }}
                label="랜덤 아이템"
                checked={isRandom}
                onChange={(event) => setIsRandom(event.currentTarget.checked)}
                withThumbIndicator={false}
                disabled={disabled}
              />

              {/* 동일 테마 아이템 여부 / 테마 타입 / 희귀도 */}
              {isRandom && (
                <>
                  <Switch
                    classNames={{
                      body: classes.SwitchBody,
                    }}
                    styles={{
                      track: {
                        backgroundColor: `${
                          isSameTheme ? "var(--blue)" : "var(--gray-f2)"
                        }`,
                      },
                    }}
                    label="동일 테마 아이템"
                    checked={isSameTheme}
                    onChange={(event) =>
                      setSameTheme(event.currentTarget.checked)
                    }
                    withThumbIndicator={false}
                    disabled={disabled}
                  />
                  <Group gap={8}>
                    <Select
                      classNames={{ input: classes.SelectInput }}
                      data={[
                        { value: "NORMAL", label: "일반" },
                        { value: "VIP", label: "VIP" },
                        { value: "LUCK", label: "럭" },
                        { value: "CASH", label: "현질" },
                      ]}
                      value={themeType}
                      onChange={setThemeType}
                      rightSection={null}
                      disabled={disabled}
                    />
                    <Select
                      classNames={{ input: classes.SelectInput }}
                      data={[
                        { value: "SR", label: "슈레" },
                        { value: "R", label: "레어" },
                        { value: "N", label: "노멀" },
                      ]}
                      value={rarity}
                      onChange={setRarity}
                      rightSection={null}
                      disabled={disabled}
                    />
                  </Group>
                </>
              )}
            </Stack>
          </Group>
        </Stack>
      </div>
    );
  },
);

interface GiftProps {
  initialData?: GiftData;
  isTop: boolean;
  isBottom: boolean;
  moveUp: () => void;
  moveDown: () => void;
  disabled?: boolean;
  onDelete: () => void;
}

const Gift = forwardRef(
  (
    {
      initialData,
      isTop,
      isBottom,
      moveUp,
      moveDown,
      disabled,
      onDelete,
    }: GiftProps,
    ref,
  ) => {
    const [themeName, setThemeName] = useState("");
    const [itemName, setItemName] = useState("");

    const [file, setFile] = useState<File | string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
      if (file instanceof File) {
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url); // clean-up
      }

      setPreview(file);
    }, [file]);

    useEffect(() => {
      if (!initialData) {
        setThemeName("");
        setItemName("");
        setFile(null);
        return;
      }

      setThemeName(initialData.theme_name);
      setItemName(initialData.gift_name);
      setFile(initialData.gift_url);
    }, [initialData]);

    useImperativeHandle(ref, () => ({
      getData: () => ({
        theme_name: themeName,
        gift_name: itemName,
        gift_file: file,
      }),
    }));

    return (
      <Group align="center" gap={8} h={80}>
        <Flex align="center" justify="center" w={125}>
          {!preview ? (
            <AddFileButton
              icon="/images/add-file-button/add-file.svg"
              size={28}
              fileRatio="1:1"
              setFile={setFile}
            />
          ) : (
            <div className={classes.GiftImageWrapper}>
              {/* 선물 삭제 버튼 */}
              {!disabled && (
                <UnstyledButton
                  className={classes.DeleteGiftButton}
                  w={20}
                  h={20}
                  onClick={onDelete}
                >
                  <Image
                    src="/images/theme-setting/delete-gift.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                </UnstyledButton>
              )}

              <Image src={preview} alt="" width={80} height={80} />
            </div>
          )}
        </Flex>

        {/* 테마 이름 / 아이템 이름 */}
        <Stack gap={0} style={{ flex: 1 }}>
          <Input
            classNames={{ input: classes.GiftInput }}
            styles={{ wrapper: { height: "28px" } }}
            variant="unstyled"
            placeholder="테마 이름"
            value={themeName}
            onChange={(event) => setThemeName(event.currentTarget.value)}
            disabled={disabled}
          />
          <Input
            classNames={{ input: classes.GiftInput }}
            variant="unstyled"
            placeholder="아이템 이름"
            value={itemName}
            onChange={(event) => setItemName(event.currentTarget.value)}
            disabled={disabled}
          />
        </Stack>

        <Stack gap={0}>
          <div style={{ width: "24px", height: "24px" }}>
            {!disabled && !isTop && (
              <UnstyledButton
                className={classes.GiftAlignButton}
                w={24}
                h={24}
                onClick={moveUp}
              >
                <Image
                  src="/images/theme-setting/arrow-up.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </UnstyledButton>
            )}
          </div>
          <div style={{ width: "24px", height: "24px" }}>
            {!disabled && !isBottom && (
              <UnstyledButton
                className={classes.GiftAlignButton}
                w={24}
                h={24}
                onClick={moveDown}
              >
                <Image
                  src="/images/theme-setting/arrow-down.svg"
                  alt=""
                  width={24}
                  height={24}
                />
              </UnstyledButton>
            )}
          </div>
        </Stack>
      </Group>
    );
  },
);
